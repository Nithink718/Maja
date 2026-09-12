import asyncio
import httpx

BASE_URL = "http://127.0.0.1:8000/api"

async def test_full_pipeline():
    async with httpx.AsyncClient(timeout=30.0) as client:
        print("1. Testing Health...")
        res = await client.get("http://127.0.0.1:8000/health")
        assert res.status_code == 200, f"Health failed: {res.text}"
        print("[OK] Health Check Passed")

        print("2. Requesting Candidate OTP...")
        res = await client.post(f"{BASE_URL}/auth/request-otp", json={"email": "alex.engineer@example.com", "role": "candidate"})
        assert res.status_code == 200, f"OTP request failed: {res.text}"
        otp_data = res.json()
        otp = otp_data.get("dev_otp") or "123456"
        print(f"[OK] OTP Received: {otp}")

        print("3. Verifying OTP & Generating Session...")
        res = await client.post(f"{BASE_URL}/auth/verify-otp", json={
            "email": "alex.engineer@example.com",
            "otp_code": otp,
            "role": "candidate",
            "full_name": "Alex Johnson"
        })
        assert res.status_code == 200, f"OTP verify failed: {res.text}"
        auth_data = res.json()
        candidate_id = auth_data["candidate_id"]
        token = auth_data["token"]
        headers = {"Authorization": f"Bearer {token}"}
        print(f"[OK] Candidate Authenticated. ID: {candidate_id}")

        print("4. Updating Personal Information...")
        res = await client.post(f"{BASE_URL}/candidates/update-personal/{candidate_id}", json={
            "full_name": "Alex Johnson",
            "education": "B.S. in Computer Science | Stanford University | 2024",
            "certifications": "AWS Certified Developer, Google Cloud Professional Architect",
            "github_url": "https://github.com/alex/distributed-cache"
        }, headers=headers)
        assert res.status_code == 200
        print("[OK] Candidate Profile Updated")

        print("5. Creating Mock Interview Session...")
        res = await client.post(f"{BASE_URL}/interviews/create/{candidate_id}", json={
            "company": "Google",
            "role": "Software Engineer",
            "domain": "Software Development",
            "number_of_questions": 4,
            "difficulty": "Medium"
        }, headers=headers)
        assert res.status_code == 200
        interview_data = res.json()
        interview_id = interview_data["interview_id"]
        print(f"[OK] Interview Initialized. ID: {interview_id}")

        print("6. Starting Interview Clock...")
        res = await client.post(f"{BASE_URL}/interviews/start/{interview_id}", headers=headers)
        assert res.status_code == 200
        print("[OK] Interview Clock Started")

        print("7. Generating Adaptive Interview Question 1...")
        res = await client.get(f"{BASE_URL}/interviews/{interview_id}/next-question", headers=headers)
        assert res.status_code == 200
        q1 = res.json()["question"]
        print(f"[OK] Question 1 ({q1['category']}): {q1['question_text']}")

        print("8. Submitting Candidate Answer 1...")
        res = await client.post(f"{BASE_URL}/interviews/{interview_id}/answer", json={
            "question_id": q1["id"],
            "answer_text": "I have extensive experience designing distributed microservices with FastAPI and PostgreSQL, focusing on sub-millisecond cache hits with Redis.",
            "duration_seconds": 25.0
        }, headers=headers)
        assert res.status_code == 200
        print("[OK] Answer 1 Persisted")

        print("9. Generating Adaptive Follow-up Question 2...")
        res = await client.get(f"{BASE_URL}/interviews/{interview_id}/next-question", headers=headers)
        assert res.status_code == 200
        q2 = res.json()["question"]
        print(f"[OK] Question 2 ({q2['category']}): {q2['question_text']}")

        print("10. Submitting Candidate Answer 2...")
        res = await client.post(f"{BASE_URL}/interviews/{interview_id}/answer", json={
            "question_id": q2["id"],
            "answer_text": "When latency spikes occurred under heavy concurrency, I used database connection pooling, query indexing, and rate-limiting to stabilize response times.",
            "duration_seconds": 30.0
        }, headers=headers)
        assert res.status_code == 200
        print("[OK] Answer 2 Persisted")

        print("11. Completing Interview & Running Multi-Agent 4-Dimension Evaluation...")
        res = await client.post(f"{BASE_URL}/interviews/{interview_id}/complete", headers=headers)
        assert res.status_code == 200
        complete_res = res.json()
        print(f"[OK] Evaluation Complete! Overall Score: {complete_res['overall_score']}")

        print("12. Fetching Persisted Evaluation Dossier...")
        res = await client.get(f"{BASE_URL}/interviews/{interview_id}/report", headers=headers)
        assert res.status_code == 200
        report = res.json()
        print(f"[OK] Report Retrieved:")
        print(f"   * Technical Score: {report['technical']['score']}/100")
        print(f"   * Behavioural Score: {report['behavioural']['score']}/100")
        print(f"   * Product Manager Score: {report['product_manager']['score']}/100")
        print(f"   * Hiring Manager Score: {report['hiring_manager']['score']}/100")
        print(f"   * Overall Average: {report['overall_score']}/100")
        print(f"   * Hiring Recommendation: {report['recommendation']}")

        print("13. Testing Organization Candidate Leaderboard...")
        res = await client.get(f"{BASE_URL}/organizations/rankings")
        assert res.status_code == 200
        rankings = res.json()
        assert len(rankings) > 0, "Rankings should contain completed interview"
        print(f"[OK] Organization Leaderboard verified ({len(rankings)} ranked candidate(s))")

        print("\n=== ALL 13 END-TO-END PIPELINE TESTS PASSED PERFECTLY! ===")

if __name__ == "__main__":
    asyncio.run(test_full_pipeline())
