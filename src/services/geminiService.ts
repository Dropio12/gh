import { GoogleGenAI, Type } from "@google/genai";
import { DynamicFormSchema } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function verifyAndExtractDocument(
  file: { type: 'pdf' | 'xfa' | 'image', content: string, mimeType: string },
  documentTitle: string,
  documentDescription: string,
  schema: DynamicFormSchema,
  language: string
): Promise<{ isValid: boolean; reason: string; extractedData: Record<string, any> }> {
  
  const filePart = file.type === 'xfa' 
    ? { text: `Here is the extracted XML data from a dynamic XFA PDF document. Please analyze this XML:\n\n${file.content}` }
    : { inlineData: { mimeType: file.mimeType, data: file.content } };

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        filePart,
        {
          text: `You are an AI assistant helping a user fill out an immigration form.
The user was asked to upload a document matching this requirement:
Title: "${documentTitle}"
Description: "${documentDescription}"

Task 1: Verify if the uploaded document matches the requirement.
Task 2: If it matches, extract any relevant information from the document that can be used to answer the questions in the provided form schema.

Form Schema Fields:
${JSON.stringify(schema.steps.flatMap(s => s.fields), null, 2)}

Return a JSON object with:
- isValid: boolean (true if the document is the correct type, false otherwise)
- reason: string (If isValid is false, explain why in ${language}. If true, provide a short success message in ${language}.)
- extractedData: object (Key-value pairs where keys are the field 'id's from the schema, and values are the extracted strings/booleans/numbers. Only include fields you are confident about.)`
        }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          isValid: { type: Type.BOOLEAN },
          reason: { type: Type.STRING },
          extractedData: {
            type: Type.OBJECT,
            description: "Key-value pairs of extracted data matching the schema field IDs"
          }
        },
        required: ["isValid", "reason", "extractedData"]
      }
    }
  });

  return JSON.parse(response.text || '{"isValid": false, "reason": "Failed to analyze document", "extractedData": {}}');
}

export async function translateSchema(schema: DynamicFormSchema, language: string): Promise<DynamicFormSchema> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        {
          text: `Translate the following JSON form schema into the language code: ${language}.
Keep the exact same JSON structure, keys, and IDs. Only translate the human-readable strings like 'title', 'subtitle', 'description', 'label', and 'value'/'label' inside options.

Schema to translate:
${JSON.stringify(schema, null, 2)}`
        }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          subtitle: { type: Type.STRING },
          steps: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                fields: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      label: { type: Type.STRING },
                      type: { type: Type.STRING },
                      options: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            value: { type: Type.STRING },
                            label: { type: Type.STRING }
                          }
                        }
                      },
                      required: { type: Type.BOOLEAN }
                    },
                    required: ["id", "label", "type"]
                  }
                }
              },
              required: ["id", "title", "fields"]
            }
          },
          documents: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                description: { type: Type.STRING }
              },
              required: ["id", "title", "description"]
            }
          }
        },
        required: ["title", "subtitle", "steps", "documents"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
}

export async function analyzeImmigrationForm(files: { type: 'pdf' | 'xfa', content: string }[], language: string): Promise<DynamicFormSchema> {
  const fileParts = files.map(file => {
    if (file.type === 'pdf') {
      return {
        inlineData: {
          mimeType: "application/pdf",
          data: file.content
        }
      };
    } else {
      return {
        text: `Here is the extracted XML data from a dynamic XFA PDF form. Please analyze this XML to extract the form fields and structure:\n\n${file.content}`
      };
    }
  });

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        ...fileParts,
        {
          text: `Analyze these Canadian immigration forms. Extract all the fields required to fill them out. IMPORTANT: Combine any duplicate fields across the forms (e.g., if multiple forms ask for "First Name", only include it once). Group these fields into logical categories (steps) like Personal Information, Employment, etc. Also, identify any supporting documents that are typically required for these forms. Return the result as a JSON object matching the provided schema. Please provide all text, labels, and descriptions in the following language code: ${language}.`
        }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "The combined title of the forms" },
          subtitle: { type: Type.STRING, description: "The form numbers or subtitle" },
          steps: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                fields: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      label: { type: Type.STRING },
                      type: { type: Type.STRING, description: "One of: text, date, select, checkbox, textarea, number" },
                      options: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            value: { type: Type.STRING },
                            label: { type: Type.STRING }
                          }
                        }
                      },
                      required: { type: Type.BOOLEAN }
                    },
                    required: ["id", "label", "type"]
                  }
                }
              },
              required: ["id", "title", "fields"]
            }
          },
          documents: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                description: { type: Type.STRING }
              },
              required: ["id", "title", "description"]
            }
          }
        },
        required: ["title", "subtitle", "steps", "documents"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
}

export async function generateXfaXmlData(
  originalXfaXml: string,
  formData: Record<string, any>
): Promise<string> {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: {
      parts: [
        {
          text: `You are an expert in Adobe XFA forms.
I have the original XFA XML template and a JSON object containing the user's answers.
Your task is to generate the filled XFA datasets XML that can be imported into the original PDF.

Original XFA XML:
${originalXfaXml.substring(0, 50000)}

User's Form Data:
${JSON.stringify(formData, null, 2)}

Instructions:
1. Analyze the Original XFA XML to understand the structure of the <xfa:datasets> or <xfa:data> section.
2. Map the User's Form Data to the corresponding fields in the XML.
3. Generate the complete, valid XML for the filled data section.
4. Return ONLY the raw XML string, without any markdown formatting or code blocks. Do not include \`\`\`xml.`
        }
      ]
    },
    config: {
      temperature: 0.1
    }
  });

  let xml = response.text || "";
  if (xml.startsWith('\`\`\`xml')) {
    xml = xml.replace(/^\`\`\`xml\n/, '').replace(/\n\`\`\`$/, '');
  } else if (xml.startsWith('\`\`\`')) {
    xml = xml.replace(/^\`\`\`\n/, '').replace(/\n\`\`\`$/, '');
  }
  return xml.trim();
}
