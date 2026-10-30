// Tiny text helpers shared by the components that read their copy from
// src/data/siteContent.json.
//
// Some copy carries a value the code knows at render time (a password length,
// an OTP expiry). The JSON stores it as "{min}" / "{minutes}" and the component
// fills it in here, so the wording stays editable without duplicating it.
export const fill = (template, values = {}) =>
  String(template ?? '').replace(/\{(\w+)\}/g, (match, key) =>
    values[key] === undefined ? match : String(values[key]),
  );
