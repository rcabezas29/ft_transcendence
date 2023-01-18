import * as bcrypt from 'bcrypt';

interface SeedUser {
    email: string;
    username: string;
    password: string;
    //roles: string[];
}

interface SeedData {
    users: SeedUser[];
}


export const initialData: SeedData = {
    users: [
        {
            email: 'apavel@example.com',
            username: 'apavel',
            password: '1234',
            //password: bcrypt.hashSync('Abc123', 10),
            //roles: ['admin']
        },
        {
            email: 'ajuncosa@example.com',
            username: 'ajuncosa',
            password: '1234',
            //password: bcrypt.hashSync('Abc123', 10),
            //roles: ['admin']
        },
        {
            email: 'dpuente@example.com',
            username: 'dpuente',
            password: '1234',
            //password: bcrypt.hashSync('Abc123', 10),
            //roles: ['admin']
        },
        {
            email: 'rcabezas@example.com',
            username: 'rcabezas',
            password: '1234',
            //password: bcrypt.hashSync('Abc123', 10),
            //roles: ['admin']
        },
        {
            email: 'npinto@example.com',
            username: 'npinto',
            password: '1234',
            //password: bcrypt.hashSync('Abc123', 10),
            //roles: ['admin']
        },
    ],
}