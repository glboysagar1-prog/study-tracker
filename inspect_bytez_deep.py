import bytez
import inspect
import sys

print(f"Bytez file: {bytez.__file__}")
print(f"Dir(bytez): {dir(bytez)}")

if hasattr(bytez, 'Bytez'):
    val = getattr(bytez, 'Bytez')
    print(f"bytez.Bytez type: {type(val)}")
    print(f"bytez.Bytez repr: {val}")
else:
    print("bytez.Bytez NOT found in attributes")

# Check version if available
version = getattr(bytez, '__version__', 'unknown')
print(f"Bytez version: {version}")
