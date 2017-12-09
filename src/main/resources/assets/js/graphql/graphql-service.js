class GraphQlService {
    static fetch(query, variables) {
        return fetch(config.officeLeagueAppUrl + '/_/service/com.enonic.app.officeleague/graphql', {
            method: 'POST',
            body: JSON.stringify({
                query: query,
                variables: variables
            })
        }).then(response => response.json())
            .then(json => json.data);
        //TODO Handle errors
    }
}