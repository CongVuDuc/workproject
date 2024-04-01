FROM python:3-slim
WORKDIR /usr/src/app
COPY http.reqs.txt ./
RUN python -m pip install --no-cache-dir stripe -r http.reqs.txt 
COPY microservices/payment/payment.py ./
CMD [ "python", "./payment.py" ]