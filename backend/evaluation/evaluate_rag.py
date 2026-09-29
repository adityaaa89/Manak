import json
import requests
import os

def evaluate():
    print("=== RAG Evaluation Module ===")
    
    base_dir = os.path.dirname(__file__)
    queries_file = os.path.join(base_dir, "test_queries.json")
    expected_file = os.path.join(base_dir, "expected_results.json")
    
    with open(queries_file, "r") as f:
        queries = json.load(f)
        
    with open(expected_file, "r") as f:
        expected = json.load(f)
        
    expected_map = {item["id"]: item for item in expected}
    
    total = len(queries)
    metrics = {
        "correct_document_retrieved": 0,
        "correct_category_detected": 0,
        "citation_availability": 0,
        "response_grounding": 0
    }
    
    url = "http://127.0.0.1:8000/api/chat/query"
    
    for q in queries:
        print(f"\nEvaluating Query: '{q['query']}'")
        exp = expected_map.get(q["id"])
        
        try:
            response = requests.post(url, json={"query": q["query"]})
            if response.status_code != 200:
                print(f"Error: {response.status_code}")
                continue
                
            data = response.json()
            
            # Metric 1: Correct document retrieved
            # Check if any expected keyword is in retrieved sources
            docs = []
            for src in data.get("sources", []):
                docs.append(src.get("document", "").lower())
            
            # Also check structured evidence sources if we appended them or just standard documents
            # In our hybrid RAG, structured sources might not be in "sources" list directly if they weren't vectorized,
            # but we can check if they were used.
            doc_matched = False
            for doc in docs:
                for kw in exp["expected_document_keywords"]:
                    if kw.lower() in doc.lower():
                        doc_matched = True
                        break
            
            # In case the hybrid RAG returns it in standard or qco_status fields
            if data.get("standard") and any("is 302" in kw.lower() for kw in exp["expected_document_keywords"]) and "is 302" in data.get("standard").lower():
                doc_matched = True
                
            if doc_matched:
                metrics["correct_document_retrieved"] += 1
                
            # Metric 2: Correct category detected
            intent = data.get("intent", "").lower()
            if exp["expected_category"].lower() in intent:
                metrics["correct_category_detected"] += 1
                
            # Metric 3: Citation availability
            if len(data.get("sources", [])) > 0:
                metrics["citation_availability"] += 1
                
            # Metric 4: Response grounding (does the answer mention expected concepts?)
            answer = data.get("answer", "").lower()
            grounded = any(kw.lower() in answer for kw in exp["must_mention"])
            if grounded:
                metrics["response_grounding"] += 1
                
            print(f"  - Doc Matched: {doc_matched}")
            print(f"  - Cat Matched: {exp['expected_category'].lower() in intent}")
            print(f"  - Citations: {len(data.get('sources', [])) > 0}")
            print(f"  - Grounding: {grounded}")
            
        except Exception as e:
            print(f"Exception during request: {e}")
            
    print("\n=== Final Evaluation Metrics ===")
    print(f"Total Queries: {total}")
    print(f"Correct Document Retrieved: {metrics['correct_document_retrieved']} / {total} ({(metrics['correct_document_retrieved']/total)*100:.1f}%)")
    print(f"Correct Category Detected: {metrics['correct_category_detected']} / {total} ({(metrics['correct_category_detected']/total)*100:.1f}%)")
    print(f"Citation Availability: {metrics['citation_availability']} / {total} ({(metrics['citation_availability']/total)*100:.1f}%)")
    print(f"Response Grounding: {metrics['response_grounding']} / {total} ({(metrics['response_grounding']/total)*100:.1f}%)")

if __name__ == "__main__":
    evaluate()
