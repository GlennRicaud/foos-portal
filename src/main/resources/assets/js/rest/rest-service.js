class RestService {
    static fetch(serviceName, body) {
        return fetch(config.serviceUrl + '/' + serviceName, {
            method: 'POST',
            body: JSON.stringify(body)
        }).then(response => response.json())
            .then(json => json.data);
        //TODO Handle errors
    }
}