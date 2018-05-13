import * as Neo4J from "neo4j-driver";

let assert = require('assert').strict;

export class Neo4jConnection {
    public driver;

    public constructor(config: any) {
        if (config.hasOwnProperty("neo4j")) {
            let auth = Neo4J.v1.auth.basic(config.neo4j.user, config.neo4j.password);
            this.driver = Neo4J.v1.driver(config.neo4j.url, auth);
            this.checkConnection();
        }
    }

    public checkConnection() {
        this.driver.session().run('MATCH (n:User) RETURN n LIMIT {countParam}', {countParam: 1})
            .subscribe({
                onNext: function () {
                },
                onError: (err) => {
                    this.onError(err);
                }
            });
    }

    public onError(errs) {
        console.log(errs);
        process.exit(1);
    }
}