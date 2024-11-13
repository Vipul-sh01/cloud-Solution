import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';

const UserModel = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        userid: {
            type: DataTypes.UUID,
            defaultValue: uuidv4,
            primaryKey: true,
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: true,
            unique: true,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        phoneNumber: {
            type: DataTypes.STRING(13),
            allowNull: true,
            unique: true,
        },
        otpCode: {
            type: DataTypes.STRING(6),
            allowNull: true,
            defaultValue: null,
        },
        otpExpiration: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: null,
        },
        otpVerified: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        isEmailVerified: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        resetToken: {  
            type: DataTypes.STRING(6),
            allowNull: true,
            defaultValue: null,
        },
        tokenExpiration: { 
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: null,
        },
        isPhoneVerified: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        emailVerificationToken: {
            type: DataTypes.STRING(6),
            allowNull: true,
            defaultValue: null,
        },
        googleId: {
            type: DataTypes.STRING(50),
            allowNull: true,
            defaultValue: null,
        },
        facebookId: {
            type: DataTypes.STRING(50),
            allowNull: true,
            defaultValue: null,
        },
        role: {
            type: DataTypes.ENUM('admin', 'user'),
            allowNull: false,
            defaultValue: 'user',
        },
        lastLogin: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: null,
        },
    }, {
        timestamps: true,
        tableName: 'User',
        hooks: {
            beforeCreate: async (user) => {
                user.password = (user.password && typeof user.password === 'string' && user.password.trim()) 
                    ? await bcrypt.hash(user.password, 10) 
                    : user.password;

                user.otpCode = (user.otpCode && typeof user.otpCode === 'string' && user.otpCode.trim()) 
                    ? await bcrypt.hash(user.otpCode, 10) 
                    : user.otpCode;
            },
            beforeUpdate: async (user) => {
                user.password = (user.changed('password') && typeof user.password === 'string' && user.password.trim()) 
                    ? await bcrypt.hash(user.password, 10) 
                    : user.password;

                user.otpCode = (user.changed('otpCode') && typeof user.otpCode === 'string' && user.otpCode.trim()) 
                    ? await bcrypt.hash(user.otpCode, 10) 
                    : user.otpCode;
            },
        },
        
    });
    
    User.prototype.compareHash = async function (input, type) {
        if (type !== 'password' && type !== 'otpCode') {
            throw new Error(`Invalid type specified: ${type}`);
        }
        const hashToCompare = type === 'password' ? this.password : this.otpCode;
        if (!hashToCompare) {
            throw new Error(`Hash not found for type: ${type}`);
        }
        return await bcrypt.compare(input, hashToCompare);
    };
    return User;
};

export { UserModel };
