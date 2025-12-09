try:
    import bytez
    print("Bytez module imported.")
    print(f"Attributes: {dir(bytez)}")
    
    # Check for common variations if Bytez cache class isn't found
    if hasattr(bytez, 'BytezClient'):
        print("Found BytezClient")
    if hasattr(bytez, 'Client'):
        print("Found Client")
        
except ImportError as e:
    print(f"ImportError: {e}")
except Exception as e:
    print(f"Error: {e}")
