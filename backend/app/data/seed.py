import sys
import os
import datetime

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from app.database.database import SessionLocal
from app.models.all_models import (
    User, UserRole, ManufacturerProfile, ProductProfile, Standard,
    QCO, TestRequirement, TestRequirementType, Laboratory, LicenceRecord,
    Document, ProductStandardMapping
)

def seed_data():
    db = SessionLocal()
    print("Seeding demo data...")

    try:
        # Check if users already exist
        if db.query(User).first():
            print("Database already seeded. Skipping.")
            return

        # 1. Users and Profiles
        user1 = User(name="Demo Manufacturer", email="mfg@demo.com", role=UserRole.MANUFACTURER)
        db.add(user1)
        db.commit()

        mfg_profile = ManufacturerProfile(
            user_id=user1.id, 
            company_name="Stellar Appliances Pvt. Ltd.", 
            enterprise_type="MSME",
            location="Delhi", 
            industry="Consumer Electronics"
        )
        db.add(mfg_profile)
        db.commit()

        # 2. Standards (10)
        standards_data = [
            ("IS 302-2-15:2025", "Safety of Household Electrical Appliances - Kettles", "Scheme-I"),
            ("IS 2347:2017", "Domestic Pressure Cookers", "Scheme-I"),
            ("IS 16102(Part 1):2012", "Self-Ballasted LED Lamps", "Scheme-I"),
            ("IS 14543:2016", "Packaged Drinking Water", "Scheme-I"),
            ("IS 4151:2015", "Protective Helmets for Two Wheeler Riders", "Scheme-I"),
            ("IS 1293:2019", "Plugs and Socket-Outlets", "Scheme-I"),
            ("IS 17855:2022", "Electric Toys", "Scheme-I"),
            ("IS 732:2019", "Code of Practice for Electrical Wiring", "Voluntary"),
            ("IS 17562:2021", "Polycarbonate Drinking Glasses", "Scheme-I"),
            ("IS 16240:2015", "RO Water Purifiers", "Scheme-I")
        ]
        standards = []
        for sn, st, sc in standards_data:
            std = Standard(standard_number=sn, title=st, scheme=sc, status="Active")
            db.add(std)
            standards.append(std)
        db.commit()

        # 3. Products (5)
        products_data = [
            ("Electric Kettle", "Household Electrical", "Stainless Steel", "Domestic"),
            ("Pressure Cooker", "Kitchenware", "Aluminium", "Domestic"),
            ("LED Bulb", "Lighting", "Plastic/Glass", "Indoor"),
            ("Packaged Drinking Water", "Food & Beverage", "Water", "Consumption"),
            ("Helmet", "Safety Gear", "ABS Plastic", "Outdoor")
        ]
        products = []
        for pn, cat, mat, use in products_data:
            prod = ProductProfile(
                manufacturer_id=mfg_profile.id,
                product_name=pn, category=cat, material=mat, usage=use
            )
            db.add(prod)
            products.append(prod)
        db.commit()

        # 4. Product-Standard Mappings
        for i in range(5):
            mapping = ProductStandardMapping(
                product_id=products[i].id,
                standard_id=standards[i].id,
                confidence_score=0.98,
                matching_reason="Direct category match based on demo data."
            )
            db.add(mapping)
        db.commit()

        # 5. QCO (10)
        for std in standards:
            qco = QCO(
                standard_id=std.id, 
                status="Mandatory", 
                effective_date=datetime.datetime(2025, 1, 1),
                reason="Ministry Quality Control Order"
            )
            db.add(qco)
        db.commit()

        # 6. Testing Requirements (25)
        test_names = ["Leakage Current Test", "High Voltage Test", "Drop Test", "Insulation Resistance", "Earth Continuity"]
        for std in standards[:5]:
            for tn in test_names:
                tr = TestRequirement(
                    standard_id=std.id,
                    test_name=tn,
                    clause=f"Clause {len(tn) % 5 + 1}",
                    equipment="Standard Test Rig",
                    type=TestRequirementType.R if "Current" in tn or "Drop" in tn else TestRequirementType.S
                )
                db.add(tr)
        db.commit()

        # 7. Laboratories (15)
        labs = []
        for i in range(15):
            lab = Laboratory(
                name=f"Demo Test House {i}",
                city="Mumbai" if i % 2 == 0 else "Delhi",
                recognition_status="Active",
                accreditation="NABL",
                supported_standards=[standards[i % 10].standard_number]
            )
            db.add(lab)
        db.commit()

        # 8. Licence Records (20)
        for i in range(20):
            lr = LicenceRecord(
                cml_number=f"CM/L-{1000000 + i}",
                manufacturer=f"Demo Mfg Entity {i}",
                product_scope=products[i % 5].product_name,
                standard=standards[i % 10].standard_number,
                valid_from=datetime.datetime(2023, 1, 1),
                valid_until=datetime.datetime(2027, 12, 31),
                status="VERIFIED"
            )
            db.add(lr)
        db.commit()

        # 9. Documents (10)
        for i in range(10):
            doc = Document(
                title=f"Official Product Manual for {standards[i].standard_number}",
                source="BIS Portal",
                standard_number=standards[i].standard_number,
                version="2025-v1",
                effective_date=datetime.datetime(2025, 1, 1),
                status="Active"
            )
            db.add(doc)
        db.commit()

        print("Demo seed data successfully injected!")

    except Exception as e:
        print(f"Error seeding data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
