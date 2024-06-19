import { customParser, parseSQL } from "../../src/utils/sql/sqlParser";

describe("sqlParser", () => {
  describe("customParser", () => {
    test("replaces {} and ${} correctly", () => {
      const expression: string =
        "({s3LogicalTableMap.team} = ${132111ea-6138-4c57-a623-9ea336d76cb1})";
      const result: string = customParser(expression);

      expect(result).toBe(
        "SELECT ((`s3LogicalTableMap.team` = `132111ea-6138-4c57-a623-9ea336d76cb1`)) AS expr FROM DUAL",
      );
    });
  });

  describe("parseSQL", () => {
    test("parses a valid QuickSight expression", () => {
      const expression: string =
        "((SUM({s3LogicalTableMap.Renewable Prod})^1)/nullIf((SUM({s3LogicalTableMap.Renewable Prod LY})^1),0))-1";
      const { parsedExpression: ast } = parseSQL(expression); // Adjust type if possible

      expect(ast).toBeTruthy();
      expect(ast.type).toBe("binary_expr");
    });

    test("parses a valid QuickSight filter expression with parameter", () => {
      const expression: string =
        "({s3LogicalTableMap.team} = ${132111ea-6138-4c57-a623-9ea336d76cb1})";
      const { parsedExpression: ast } = parseSQL(expression); // Adjust type if possible

      expect(ast).toBeTruthy();
      expect(ast.type).toBe("binary_expr");
    });

    test("throws an error for invalid SQL", () => {
      const expression: string = "INVALID SQL";
      try {
        parseSQL(expression);
      } catch (error: any) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toContain("Error parsing SQL");
        expect(error.message).toContain("Expected");
      }
    });
  });
});

describe("sqlParser with custom functions", () => {
  describe("customParser", () => {
    test("replaces {} and ${} correctly", () => {
      const expression: string =
        "({s3LogicalTableMap.team} = ${132111ea-6138-4c57-a623-9ea336d76cb1})";
      const result: string = customParser(expression);

      expect(result).toBe(
        "SELECT ((`s3LogicalTableMap.team` = `132111ea-6138-4c57-a623-9ea336d76cb1`)) AS expr FROM DUAL",
      );
    });
  });

  describe("parseSQL", () => {
    test("parses maxOver function correctly", () => {
      const expression: string =
        "maxOver({field1}, [partitionField], PRE_FILTER)";
      const { parsedExpression: ast } = parseSQL(expression); // Adjust type if possible

      expect(ast).toBeTruthy();
      expect(ast.type).toBe("function");
      expect(ast.name).toBe("MAX_OVER");
    });

    test("parses stdevOver function correctly", () => {
      const expression: string =
        "stdevOver({field1}, [partitionField], POST_FILTER)";
      const { parsedExpression: ast } = parseSQL(expression); // Adjust type if possible

      expect(ast).toBeTruthy();
      expect(ast.type).toBe("function");
      expect(ast.name).toBe("STDEV_OVER");
    });

    test("parses periodOverPeriodDifference function correctly", () => {
      const expression: string =
        "periodOverPeriodDifference({sales}, {date}, {month}, {1})";
      const { parsedExpression: ast } = parseSQL(expression); // Adjust type if possible

      expect(ast).toBeTruthy();
      expect(ast.type).toBe("function");
      expect(ast.name).toBe("periodOverPeriodDifference");
    });

    test("throws an error for invalid SQL", () => {
      const expression: string = "INVALID SQL";
      try {
        parseSQL(expression);
      } catch (error: any) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toContain("Error parsing SQL");
      }
    });

    test("parses maxOver function correctly", () => {
      const expression: string = "maxOver(sum({s3LogicalTableMap.runs}), [])";
      const { parsedExpression: ast } = parseSQL(expression); // Adjust type if possible

      expect(ast).toBeTruthy();
      expect(ast.type).toBe("function");
      expect(ast.name).toBe("MAX_OVER");
    });
  });

  test("parses rank function correctly", () => {
    const expression: string =
      "rank( [sum({s3LogicalTableMap.runs}) DESC], [], PRE_FILTER )";
    const { parsedExpression: ast } = parseSQL(expression); // Adjust type if possible
    expect(ast).toBeTruthy();
    expect(ast.type).toBe("function");
    expect(ast.name).toBe("RANK");
  });
});
