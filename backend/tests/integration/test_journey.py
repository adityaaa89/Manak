import time
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)
results = []

def run_test(name, func):
    start = time.time()
    try:
        func()
        status = "PASSED"
        msg = ""
    except Exception as e:
        status = "FAILED"
        msg = str(e)
    duration = time.time() - start
    results.append({"name": name, "status": status, "duration": duration, "msg": msg})

def scenario_1():
    # 1. Product Analysis
    res1 = client.post("/api/products/analyse", json={"description": "I manufacture stainless steel electric kettles"})
    assert res1.status_code == 200, "Product Analysis failed"
    data1 = res1.json()
    assert data1["product_name"] == "Electric Kettle", f"Expected Electric Kettle, got {data1['product_name']}"
    
    # 2. Standards Discovery
    res2 = client.post("/api/standards/discover", json={
        "product_description": "I manufacture stainless steel electric kettles",
        "product_name": data1["product_name"],
        "category": data1["category"],
        "attributes": {"material": data1.get("material", ""), "usage": data1.get("usage", "")}
    })
    assert res2.status_code == 200, "Standards Discovery failed"
    data2 = res2.json()
    std_number = data2["matches"][0]["standard_number"]
    std_id_int = data2["matches"][0]["standard_id"]
    assert "IS 302" in std_number, f"Expected IS 302, got {std_number}"
    
    # 3. QCO
    # We use std_id_int or std_number based on what the API expects. Assuming the API expects the DB primary key or standard string.
    res3 = client.post(f"/api/qco/check/{std_id_int}", json={})
    assert res3.status_code == 200, "QCO failed"
    data3 = res3.json()
    assert data3["status"] == "Mandatory", "Expected mandatory"
    
    # 4. Testing Requirements
    res4 = client.get(f"/api/testing/requirements/{std_id_int}")
    assert res4.status_code == 200, "Testing Requirements failed"
    data4 = res4.json()
    assert len(data4["tests"]) > 0, "Expected tests"
    
    # 5. Factory Readiness
    res5 = client.post("/api/factory/assess", json={
        "standard_id": std_id_int,
        "responses": {
            "testing_equipment_available": True,
            "calibration_valid": False,
            "quality_records_available": True
        }
    })
    assert res5.status_code == 200, "Factory Readiness failed"
    data5 = res5.json()
    assert "overall_score" in data5, "Expected overall_score"
    
    # 6. Laboratory Finder
    res6 = client.post("/api/laboratories/search", json={
        "standard_id": std_id_int,
        "required_tests": ["Electrical Safety"],
        "location": {"city": "Mumbai"}
    })
    assert res6.status_code == 200, "Laboratory Finder failed"
    data6 = res6.json()
    assert "results" in data6, "Expected results"
    
    # 7. Blueprint
    res7 = client.get(f"/api/blueprint/generate?product_query=kettle")
    assert res7.status_code == 200, "Blueprint failed"
    data7 = res7.json()
    assert "product" in data7, "Expected product in blueprint"

def scenario_2():
    res = client.post("/api/chat/query", json={
        "query": "What tests are required for electric kettle under IS 302-2-15?",
        "language": "English",
        "mode": "technical",
        "context_standard": "IS 302-2-15"
    })
    assert res.status_code == 200, "Chat Query failed"
    data = res.json()
    assert "answer" in data, "Expected answer"
    assert len(data["sources"]) > 0, "Expected citations"

def scenario_3():
    files = {"file": ("test_image.jpg", b"fake image data", "image/jpeg")}
    data = {"product_name": "Electric Kettle"}
    res = client.post("/api/verify/image", files=files, data=data)
    assert res.status_code == 200, "Verify Image failed"
    res_data = res.json()
    assert res_data["identifier"]["value"] == "CM/L-1000000", "Expected CM/L-1000000"
    assert res_data["verification"]["status"] == "VERIFIED", "Expected VERIFIED"

if __name__ == "__main__":
    run_test("Scenario 1: Manufacturer Compliance Journey", scenario_1)
    run_test("Scenario 2: AI Evidence Assistant", scenario_2)
    run_test("Scenario 3: Snap & Verify", scenario_3)
    
    print("=== TEST REPORT ===")
    for r in results:
        print(f"[{r['status']}] {r['name']} - {r['duration']:.2f}s")
        if r['msg']:
            print(f"  Error: {r['msg']}")
