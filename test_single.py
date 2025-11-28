import os
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from backend.pdf_generator import generate_unit_pdf

# Test with a specific subject that has data
result = generate_unit_pdf("3160704", 1)
print(f"\nResult: {result}")
