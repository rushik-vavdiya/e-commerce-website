// Specification helpers shared by the vendor and admin product forms. The API
// stores them as productSpecifications: [{ key, value }], so both forms edit the
// same "Label: value" text and convert it in one place.
export const toSpecificationLines = (specifications = []) =>
  (specifications ?? []).map((item) => `${item.key}: ${item.value}`).join('\n');

export const parseSpecificationLines = (text) =>
  String(text ?? '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const separator = line.indexOf(':');

      if (separator === -1) return { key: line, value: line };

      return {
        key: line.slice(0, separator).trim(),
        value: line.slice(separator + 1).trim(),
      };
    })
    .filter((entry) => entry.key && entry.value);
