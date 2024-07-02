class ApiError extends Error {
  statusCode: number
  body: unknown
  constructor(statusCode: number, body: unknown) {
    super(`Api error ${statusCode}`)
    this.statusCode = statusCode
    this.body = body
  }
}

export { ApiError }
