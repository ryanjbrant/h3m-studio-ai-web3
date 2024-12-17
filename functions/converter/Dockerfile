FROM python:3.10-slim

# Install minimal system dependencies
RUN apt-get update && apt-get install -y \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Install USD tools from pre-built binaries
RUN wget https://github.com/usd-wg/assets/releases/download/v23.11/usd-23.11-linux-x86_64.tar.gz && \
    tar xf usd-23.11-linux-x86_64.tar.gz -C /usr/local && \
    rm usd-23.11-linux-x86_64.tar.gz

# Add USD tools to PATH
ENV PATH="/usr/local/usd/bin:${PATH}"
ENV LD_LIBRARY_PATH="/usr/local/usd/lib:${LD_LIBRARY_PATH}"

# Set up working directory
WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the conversion script
COPY convert.py .

# Expose port
EXPOSE 8080

# Run server
CMD ["python", "convert.py"] 