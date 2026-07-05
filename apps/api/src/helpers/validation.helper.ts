export const publicIdPattern = /^[a-zA-Z0-9]{8}$/;

export function assertNonEmptyString(value: string, name: string) {
  if (value.trim().length === 0) {
    throw new Error(`${name} must not be empty.`);
  }
}

export function assertPublicId(value: string, name = "publicId") {
  if (!publicIdPattern.test(value)) {
    throw new Error(`${name} must be an 8 character alphanumeric string.`);
  }
}

export function assertUuid(value: string, name = "id") {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) {
    throw new Error(`${name} must be a valid UUID.`);
  }
}
