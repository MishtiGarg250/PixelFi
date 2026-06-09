import axios from "axios";
import { z } from "zod";

import type { MonthlyMlInput, MonthlyMlOutput } from "./ml-client.service.js";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_WEALTH_MODEL ?? "gpt-4o-mini";

export const MonthlyLlmAnalysisSchema = z.object({
  summary: z.string(),
  healthLabel: z.enum([
    "STRONG",
    "STABLE",
    "WATCH",
    "AT_RISK",
  ]),
  keyDrivers: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      metric: z.string(),
      direction: z.enum(["UP", "DOWN", "FLAT"]),
    })
  ),
  recommendations: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
      category: z.enum([
        "RISK",
        "DIVERSIFICATION",
        "PERFORMANCE",
        "SAVINGS",
        "MARKET",
      ]),
      evidence: z.array(z.string()),
      action: z.string(),
    })
  ),
  chartAnnotations: z.array(
    z.object({
      chart: z.enum([
        "NET_WORTH",
        "ALLOCATION",
        "EXPENSES",
        "PERFORMANCE",
      ]),
      label: z.string(),
      description: z.string(),
    })
  ),
  disclaimer: z.string(),
});

export type MonthlyLlmAnalysis = z.infer<
  typeof MonthlyLlmAnalysisSchema
>;

function fallbackLlmAnalysis(
  factPack: MonthlyMlInput,
  mlOutput: MonthlyMlOutput
): MonthlyLlmAnalysis {
  const snapshot = factPack.latestSnapshot;
  const recommendations: MonthlyLlmAnalysis["recommendations"] = [];

  if (snapshot.debtToAssetRatio > 0.4) {
    recommendations.push({
      title: "Reduce debt pressure",
      description:
        "Your debt-to-asset ratio is elevated and can limit flexibility.",
      priority: "HIGH",
      category: "SAVINGS",
      evidence: [
        `Debt-to-asset ratio is ${snapshot.debtToAssetRatio}`,
      ],
      action:
        "Prioritize extra payments toward high-interest liabilities.",
    });
  }

  if (snapshot.largestHoldingPercent > 40) {
    recommendations.push({
      title: "Review concentration risk",
      description:
        "A large share of your portfolio is concentrated in one holding.",
      priority: "MEDIUM",
      category: "DIVERSIFICATION",
      evidence: [
        `Largest holding is ${snapshot.largestHoldingPercent}%`,
      ],
      action:
        "Compare this allocation against your intended risk profile before adding more exposure.",
    });
  }

  if (snapshot.emergencyFundMonths < 3) {
    recommendations.push({
      title: "Build emergency runway",
      description:
        "Your cash buffer is below a common three-month baseline.",
      priority: "MEDIUM",
      category: "SAVINGS",
      evidence: [
        `Emergency fund covers ${snapshot.emergencyFundMonths} months`,
      ],
      action:
        "Route a fixed monthly amount into cash reserves until you reach three to six months.",
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      title: "Maintain current discipline",
      description:
        "Core wealth metrics are stable based on the latest snapshot.",
      priority: "LOW",
      category: "PERFORMANCE",
      evidence: [
        `Health score is ${snapshot.healthScore}`,
        `Diversification score is ${snapshot.diversificationScore}`,
      ],
      action:
        "Keep updating transactions and review allocation monthly.",
    });
  }

  return {
    summary: `Net worth is ${snapshot.netWorth.toFixed(
      0
    )}, with a ${mlOutput.health.label.toLowerCase()} wealth health profile and ${mlOutput.risk.category.toLowerCase()} risk level.`,
    healthLabel: mlOutput.health.label,
    keyDrivers: [
      {
        title: "Net worth",
        description: `Latest calculated net worth is ${snapshot.netWorth.toFixed(
          0
        )}.`,
        metric: "netWorth",
        direction: "FLAT",
      },
      {
        title: "Portfolio return",
        description: `Unrealized portfolio return is ${snapshot.portfolioReturnPercent}%.`,
        metric: "portfolioReturnPercent",
        direction:
          snapshot.portfolioReturnPercent > 0
            ? "UP"
            : snapshot.portfolioReturnPercent < 0
              ? "DOWN"
              : "FLAT",
      },
    ],
    recommendations,
    chartAnnotations: [
      {
        chart: "NET_WORTH",
        label: "Monthly baseline",
        description:
          "Use monthly snapshots to evaluate trend instead of daily noise.",
      },
    ],
    disclaimer:
      "This is educational analysis based on your PixelFi data, not financial, legal, or tax advice.",
  };
}

function buildPrompt(
  factPack: MonthlyMlInput,
  mlOutput: MonthlyMlOutput
) {
  return [
    {
      role: "system",
      content:
        "You are PixelFi's wealth analysis engine. Use only the provided facts. Return practical, cautious, educational wealth-management suggestions. Do not promise returns or provide tax/legal advice.",
    },
    {
      role: "user",
      content: JSON.stringify({
        factPack,
        mlOutput,
        outputContract:
          "Return JSON with summary, healthLabel, keyDrivers, recommendations, chartAnnotations, and disclaimer.",
      }),
    },
  ];
}

export async function generateMonthlyLlmAnalysis(
  factPack: MonthlyMlInput,
  mlOutput: MonthlyMlOutput
): Promise<MonthlyLlmAnalysis> {
  if (!OPENAI_API_KEY) {
    return fallbackLlmAnalysis(factPack, mlOutput);
  }

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/responses",
      {
        model: OPENAI_MODEL,
        input: buildPrompt(factPack, mlOutput),
        text: {
          format: {
            type: "json_schema",
            name: "monthly_wealth_analysis",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              required: [
                "summary",
                "healthLabel",
                "keyDrivers",
                "recommendations",
                "chartAnnotations",
                "disclaimer",
              ],
              properties: {
                summary: { type: "string" },
                healthLabel: {
                  type: "string",
                  enum: [
                    "STRONG",
                    "STABLE",
                    "WATCH",
                    "AT_RISK",
                  ],
                },
                keyDrivers: {
                  type: "array",
                  items: {
                    type: "object",
                    additionalProperties: false,
                    required: [
                      "title",
                      "description",
                      "metric",
                      "direction",
                    ],
                    properties: {
                      title: { type: "string" },
                      description: { type: "string" },
                      metric: { type: "string" },
                      direction: {
                        type: "string",
                        enum: ["UP", "DOWN", "FLAT"],
                      },
                    },
                  },
                },
                recommendations: {
                  type: "array",
                  items: {
                    type: "object",
                    additionalProperties: false,
                    required: [
                      "title",
                      "description",
                      "priority",
                      "category",
                      "evidence",
                      "action",
                    ],
                    properties: {
                      title: { type: "string" },
                      description: { type: "string" },
                      priority: {
                        type: "string",
                        enum: ["LOW", "MEDIUM", "HIGH"],
                      },
                      category: {
                        type: "string",
                        enum: [
                          "RISK",
                          "DIVERSIFICATION",
                          "PERFORMANCE",
                          "SAVINGS",
                          "MARKET",
                        ],
                      },
                      evidence: {
                        type: "array",
                        items: { type: "string" },
                      },
                      action: { type: "string" },
                    },
                  },
                },
                chartAnnotations: {
                  type: "array",
                  items: {
                    type: "object",
                    additionalProperties: false,
                    required: [
                      "chart",
                      "label",
                      "description",
                    ],
                    properties: {
                      chart: {
                        type: "string",
                        enum: [
                          "NET_WORTH",
                          "ALLOCATION",
                          "EXPENSES",
                          "PERFORMANCE",
                        ],
                      },
                      label: { type: "string" },
                      description: { type: "string" },
                    },
                  },
                },
                disclaimer: { type: "string" },
              },
            },
          },
        },
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );

    const outputText = response.data?.output_text ?? response.data?.output?.[0]?.content?.[0]?.text;

    return MonthlyLlmAnalysisSchema.parse(JSON.parse(outputText));
  } catch (error) {
    console.warn(
      "LLM analysis unavailable; using fallback analysis",
      error instanceof Error ? error.message : "unknown error"
    );

    return fallbackLlmAnalysis(factPack, mlOutput);
  }
}
