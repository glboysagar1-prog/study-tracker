#!/bin/bash

# MLX Setup Script for Apple M4 Mac
# Sets up IndicLLM models with MLX optimization

set -e  # Exit on error

echo "🚀 GTU Multilingual AI - MLX Setup"
echo "===================================="
echo ""

# Check if running on Apple Silicon
if [[ $(uname -m) != "arm64" ]]; then
    echo "❌ Error: This script requires Apple Silicon (M-series chip)"
    exit 1
fi

echo "✓ Detected Apple Silicon"
echo ""

# Create models directory
MODELS_DIR="$HOME/.models/gtu-indic"
echo "📁 Creating models directory: $MODELS_DIR"
mkdir -p "$MODELS_DIR"

# Create Python virtual environment if not exists
if [ ! -d "venv_mlx" ]; then
    echo "🐍 Creating Python virtual environment..."
    python3 -m venv venv_mlx
fi

echo "📦 Activating virtual environment..."
source venv_mlx/bin/activate

# Upgrade pip
echo "⬆️  Upgrading pip..."
pip install --upgrade pip

# Install MLX requirements
echo "📚 Installing MLX and dependencies..."
pip install -r mlx_requirements.txt

echo ""
echo "🤗 Downloading IndicBART model from AI4Bharat..."
echo "   (This may take 5-10 minutes, ~2-3GB download)"
echo ""

# Download IndicBART model using Python
python3 << EOF
import os
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
import torch

model_name = "ai4bharat/IndicBART"
models_dir = "$MODELS_DIR"

print("📥 Downloading tokenizer...")
tokenizer = AutoTokenizer.from_pretrained(model_name)
tokenizer.save_pretrained(f"{models_dir}/indicbart")

print("📥 Downloading model...")
model = AutoModelForSeq2SeqLM.from_pretrained(model_name)
model.save_pretrained(f"{models_dir}/indicbart")

print("✅ Model downloaded successfully!")
print(f"📍 Location: {models_dir}/indicbart")

# Test inference
print("")
print("🧪 Testing model inference on M4...")
input_text = "Hello, how are you?"
inputs = tokenizer(input_text, return_tensors="pt")

# Check if MPS (Metal Performance Shaders) is available
if torch.backends.mps.is_available():
    print("✅ MPS (GPU) available - using M4 GPU!")
    device = torch.device("mps")
    model = model.to(device)
    inputs = {k: v.to(device) for k, v in inputs.items()}
else:
    print("⚠️  MPS not available - using CPU")
    device = torch.device("cpu")

# Run inference
with torch.no_grad():
    outputs = model.generate(**inputs, max_length=50)
    result = tokenizer.decode(outputs[0], skip_special_tokens=True)

print(f"   Input: {input_text}")
print(f"   Output: {result}")
print("")
print("✅ Inference test successful!")
EOF

echo ""
echo "📊 Model Information:"
echo "   Model: IndicBART (AI4Bharat)"
echo "   Languages: 22 Indian languages + English"
echo "   Size: ~1.5GB"
echo "   Device: Apple M4 (MPS)"
echo ""

# Create .env configuration
echo "⚙️  Updating environment configuration..."
if ! grep -q "MLX_MODEL_PATH" .env 2>/dev/null; then
    cat >> .env << EOF

# MLX Configuration (Added by setup_mlx.sh)
MLX_MODEL_PATH=$MODELS_DIR/indicbart
MLX_USE_GPU=true
MLX_BATCH_SIZE=4
MLX_MAX_LENGTH=512

# Multilingual Settings
DEFAULT_LANGUAGE=en
SUPPORTED_LANGUAGES=en,gu,hi,mr,ta,te,bn,pa,kn,ml,or,as,ne,sd,ur,bo,sa,ks,mai,brx,mni,doi

# Self-Improvement
ENABLE_EXPERIMENTS=true
EXPERIMENT_SAMPLE_RATE=0.2
IMPROVEMENT_LOOP_SCHEDULE=weekly
EOF
    echo "✅ Environment variables added to .env"
else
    echo "⚠️  MLX variables already exist in .env"
fi

echo ""
echo "✨ Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Activate the virtual environment: source venv_mlx/bin/activate"
echo "2. Test the MLX service: python backend/mlx_service.py"
echo "3. Start the enhanced backend with multilingual support"
echo ""
echo "🎉 Your M4 Mac is ready for multilingual AI!"
