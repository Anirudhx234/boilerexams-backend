const docs = {
    openapi: '3.0.1',
    info: {
        version: '1.0.0',
        title: 'Boilerexams API',
        description: 'The official Boilerexams API',
        termsOfService: 'https://www.boilerexams.com/Terms%20and%20Conditions.pdf',
        contact: {
            name: 'Boilerexams',
            email: 'boilerexams@gmail.com',
            url: 'https://boilerexams.com',
        },
        license: {
            name: 'Apache 2.0',
            url: 'https://www.apache.org/licenses/LICENSE-2.0.html',
        },
    },
    servers: [
        {
            url: 'http://localhost:8080',
            description: 'Local',
        },
        {
            url: 'https://api.boilerexams.com/dev',
            description: 'Development',
        },
        {
            url: 'https://api.boilerexams.com',
            description: 'Production',
        },
    ]
};

export default docs;