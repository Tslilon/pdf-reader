import { Anthropic } from "@anthropic-ai/sdk";
import Ajv, { type JSONSchemaType } from "ajv";

interface Transaction {
  date: string;
  type: string;
  stock_name: string;
  amount: number;
  price: number;
  currency: string;
}

interface TransactionsSchema {
  transactions: Transaction[];
}

export class ClaudeService {
  private client: Anthropic;
  private schema: JSONSchemaType<TransactionsSchema>;

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY not found in environment variables");
    }
    this.client = new Anthropic({ apiKey });
    this.schema = {
      type: "object",
      properties: {
        transactions: {
          type: "array",
          items: {
            type: "object",
            properties: {
              date: { type: "string" },
              type: { type: "string" },
              stock_name: { type: "string" },
              amount: { type: "number" },
              price: { type: "number" },
              currency: { type: "string" },
            },
            required: ["date", "type", "stock_name", "amount", "price", "currency"],
            additionalProperties: false,
          },
        },
      },
      required: ["transactions"],
      additionalProperties: false,
    };
  }

  async parseTransactions(content: string): Promise<Transaction[]> {
    try {
      const prompt = `
Please read the content below and extract transaction details. Return ONLY the JSON data without any additional text or explanation:
{
  "transactions": [
    {
      "date": "yyyy-mm-dd",
      "type": "Buy/Sell",
      "stock_name": "string",
      "amount": 0,
      "price": 0.0,
      "currency": "string"
    }
  ]
}

Transaction details:
${content}`;

      console.log("Claude Service - Sending request with content:", content.substring(0, 100) + "...");

      const response = await this.client.messages.create({
        model: "claude-3-haiku-20240307",
        max_tokens: 1024,
        system: "You are a financial analyst specialized in parsing structured transaction data. Return ONLY valid JSON without any additional text.",
        messages: [
          { role: "user", content: prompt }
        ]
      });

      console.log("Claude Service - Raw response:", response);

      const messageContent = response.content[0];
      if (messageContent.type !== "text") {
        throw new Error("Unexpected response type from Claude");
      }

      // Extract only the JSON part from the response
      const result = messageContent.text.trim();
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No valid JSON found in response");
      }
      
      const jsonString = jsonMatch[0];
      console.log("Claude Service - Extracted JSON string:", jsonString);

      const parsedResult = JSON.parse(jsonString);
      console.log("Claude Service - JSON parsed result:", parsedResult);
      
      const ajv = new Ajv();
      const validate = ajv.compile(this.schema);
      
      if (!validate(parsedResult)) {
        throw new Error(`Schema validation failed: ${JSON.stringify(validate.errors)}`);
      }

      return parsedResult.transactions;
    } catch (error) {
      console.error("Claude parsing error:", error);
      throw error;
    }
  }
}