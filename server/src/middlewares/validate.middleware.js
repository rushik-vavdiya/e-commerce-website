// Applies a Zod schema to one part of the request. Every rule lives in the
// module's *.validator.js file; controllers and services only read the result.
const validateSource = (schema, source) => {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    // Express 5 exposes req.query as a read-only getter, so the parsed query is
    // kept beside it. Body and params are plain properties and are replaced, so
    // the routes keep working exactly as before.
    req.validated = { ...req.validated, [source]: result.data };
    if (source === "body") req.body = result.data;
    if (source === "params") req.params = result.data;

    next();
  };
};

const validate = (schema) => validateSource(schema, "body");
export const validateParams = (schema) => validateSource(schema, "params");
export const validateQuery = (schema) => validateSource(schema, "query");

export default validate;
