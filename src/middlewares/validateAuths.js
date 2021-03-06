import joi from 'joi';
import bcrypt from 'bcrypt';
import { db } from '../dbStrategy/mongo.js';

export async function validateNewUser(req, res, next) {
    try {
        const newUserSchema = joi.object({
            name: joi.string().pattern(/^[a-zA-Z]*$/).required(),
            email: joi.string().email().required(),
            password: joi.string().required(),
            confirmPassword: joi.ref('password')
        });
        const user = req.body;
        const validate = newUserSchema.validate(user);
    
        if(validate.error) {
            return res.status(406).send(validate.error.details[0].message);
        }
    
        if(await db.collection('users').findOne({email: user.email})) {
            return res.status(409).send('Email já cadastrado.');
        }
        
        next();
        
    } catch (error) {
        res.status(417).send('Erro ao fazer cadastro.');
    }
}

export async function validateLogin(req, res, next) {
    try {
        const loginSchema = joi.object({
            email: joi.string().email().required(),
            password: joi.string().required()
        });
        const user = req.body;
        const validate = loginSchema.validate(user);
        const validEmail = await db.collection('users').findOne({email: user.email});
        const validPassword = validEmail ? bcrypt.compareSync(user.password, validEmail.password) : null;
    
        if(validate.error) {
            return res.status(406).send(validate.error.details[0].message);
        }
    
        if(!validPassword) {
            return res.status(401).send('Senha ou email inválidos.');
        }
    
        res.locals.validEmail = validEmail;
        next();

    } catch (error) {
        res.status(417).send('Erro ao fazer login.');
    }
}

export async function validateToken(req, res, next) {
    try {
        const { authorization } = req.headers;
    
        const token = authorization?.replace('Bearer ', '');
        const session = await db.collection('sessions').findOne({ token });
    
        if (!session) {
            return res.sendStatus(401);
        }
        
        res.locals.session = session;
        next();
        
    } catch (error) {
        res.status(417).send('Erro.');
    }
}