import request from "supertest";
import { describe, it, expect } from "vitest";

import app from "./server";

describe("System Smoke Test", () => {
    it ("GET /api/smoke-test => Returns Server status", async () => {
        const response = await request(app)
            .get("/api/smoke-test")
            .set("Authorization", "Bearer mock-token");

        // Only tests if backend is working, does not check for a database connection
        expect(response.status).toBe(200);
        expect(response.body.express).toBe("Online!");
        expect(response.body.token).toBe("Token Present");
        expect(response.body.database).toBeDefined();
    });

    it ("GET /api/smoke-test => Returns Server status: missing Authorization header", async () => {
        const response = await request(app)
            .get("/api/smoke-test");

        expect(response.status).toBe(200);
        expect(response.body.express).toBe("Online!");
        expect(response.body.token).toBe("No Token");
        expect(response.body.database).toBeDefined();
    });
});
