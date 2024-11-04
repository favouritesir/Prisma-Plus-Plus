import { buildWhere } from "../whereBuilder";
const testCases: any = [
  // 1. Simple Greater Than and Less Than
  {
    description: "Greater than and less than conditions",
    condition: "age > 20 && age < 30",
    expected: {
      AND: [{ age: { gt: 20 } }, { age: { lt: 30 } }],
    },
  },
  // 2. Equality and Inequality
  {
    description: "Equality and inequality conditions",
    condition: `status="active" && role != "admin"`,
    expected: {
      AND: [{ status: { equals: "active" } }, { role: { not: "admin" } }],
    },
  },
  // 3. Greater than or equal and less than or equal
  {
    description: "Greater than or equal and less than or equal",
    condition: "salary >= 50000 && salary <= 100000",
    expected: {
      AND: [{ salary: { gte: 50000 } }, { salary: { lte: 100000 } }],
    },
  },
  // 4. Contains, Starts With, and Ends With
  {
    description: "Contains, starts with, and ends with",
    condition: `name :: "John" && city ^ "New" && country $ "land"`,
    expected: {
      AND: [
        { name: { contains: "John" } },
        { city: { startsWith: "New" } },
        { country: { endsWith: "land" } },
      ],
    },
  },
  // 5. "In" and "Not In" conditions
  {
    description: "In and Not In conditions",
    condition: `id >> [1, 2, 3] && id << [4, 5, 6]`,
    expected: {
      AND: [{ id: { in: [1, 2, 3] } }, { id: { notIn: [4, 5, 6] } }],
    },
  },
  // 6. Has and HasEvery conditions
  {
    description: "Has and HasEvery conditions",
    condition: `tags @ "urgent" && tags @* ["important", "review"]`,
    expected: {
      AND: [
        { tags: { has: "urgent" } },
        { tags: { hasEvery: ["important", "review"] } },
      ],
    },
  },
  // 7. HasSome and IsEmpty
  {
    description: "HasSome and IsEmpty conditions",
    condition: `labels @? ["todo", "in-progress"] && comments @! true`,
    expected: {
      AND: [
        { labels: { hasSome: ["todo", "in-progress"] } },
        { comments: { isEmpty: true } },
      ],
    },
  },
  // 8. Complex Nested Conditions with AND, OR, and NOT
  {
    description: "Complex nested conditions with AND, OR, and NOT",
    condition: `(age > 18 && age < 30) || (!(status = "inactive") && (role != "admin" || location="NY"))`,
    expected: {
      OR: [
        {
          AND: [{ age: { gt: 18 } }, { age: { lt: 30 } }],
        },
        {
          AND: [
            { NOT: { status: { equals: "inactive" } } },
            {
              OR: [{ role: { not: "admin" } }, { location: { equals: "NY" } }],
            },
          ],
        },
      ],
    },
  },
  // 9. Multiple Nested Levels
  {
    description: "Multiple nested levels with different operators",
    condition: `((score >= 85 || score < 60) && !(status = "failed")) || grade="A"`,
    expected: {
      OR: [
        {
          AND: [
            {
              OR: [{ score: { gte: 85 } }, { score: { lt: 60 } }],
            },
            { NOT: { status: { equals: "failed" } } },
          ],
        },
        { grade: { equals: "A" } },
      ],
    },
  },
  // 10. Mixed AND/OR with Contains and Range Conditions
  {
    description: "Mixed AND/OR with Contains and Range conditions",
    condition: `title :: "project" && (deadline > "2024-01-01" || budget < 10000)`,
    expected: {
      AND: [
        { title: { contains: "project" } },
        {
          OR: [{ deadline: { gt: "2024-01-01" } }, { budget: { lt: 10000 } }],
        },
      ],
    },
  },
];

const runTests = () => {
  testCases.forEach((testCase: any, index: number) => {
    try {
      const result = buildWhere(testCase.condition);
      const pass = JSON.stringify(result) === JSON.stringify(testCase.expected);
      console.log(`Test Case ${index + 1}: ${testCase.description}`);
      console.log(`Condition: ${testCase.condition}`);
      console.log("Expected:", JSON.stringify(testCase.expected, null, 2));
      console.log("Result:", JSON.stringify(result, null, 2));
      console.log(`Pass: ${pass ? "✔️" : "❌"}`);
      console.log("=================");
    } catch (error: any) {
      console.error(`Test Case ${index + 1} failed with error:`, error.message);
      console.log("=================");
    }
  });
};

// Run all test cases
runTests();
