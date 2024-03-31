FROM python:3-slim
WORKDIR /usr/src/app
COPY http.reqs.txt ./
RUN python -m pip install --no-cache-dir -r http.reqs.txt
COPY ./microservices/messaging_ms/messaging.py ./
CMD [ "python", "./microservices/messaging_ms/messaging.py" ]