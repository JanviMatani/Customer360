package com.ps04.customer360.common.dto;

import java.time.Instant;
import java.util.List;

public class ApiError {
    private int status;
    private String error;
    private String message;
    private Instant timestamp;
    private List<String> details;

    public ApiError() {}

    public ApiError(int status, String error, String message, Instant timestamp, List<String> details) {
        this.status = status;
        this.error = error;
        this.message = message;
        this.timestamp = timestamp;
        this.details = details;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private int status;
        private String error;
        private String message;
        private Instant timestamp;
        private List<String> details;

        public Builder status(int status) { this.status = status; return this; }
        public Builder error(String error) { this.error = error; return this; }
        public Builder message(String message) { this.message = message; return this; }
        public Builder timestamp(Instant timestamp) { this.timestamp = timestamp; return this; }
        public Builder details(List<String> details) { this.details = details; return this; }

        public ApiError build() {
            return new ApiError(status, error, message, timestamp, details);
        }
    }

    public int getStatus() { return status; }
    public void setStatus(int status) { this.status = status; }

    public String getError() { return error; }
    public void setError(String error) { this.error = error; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public Instant getTimestamp() { return timestamp; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }

    public List<String> getDetails() { return details; }
    public void setDetails(List<String> details) { this.details = details; }
}
