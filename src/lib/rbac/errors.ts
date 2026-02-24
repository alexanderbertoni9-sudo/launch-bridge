export class PermissionDeniedError extends Error {
  constructor(message = "Forbidden") {
    super(message);
    this.name = "PermissionDeniedError";
  }
}

export class ResourceNotFoundError extends Error {
  constructor(message = "Not found") {
    super(message);
    this.name = "ResourceNotFoundError";
  }
}
