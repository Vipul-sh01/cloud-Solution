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
            type: DataTypes.STRING(10),
            allowNull: true,
            unique: true,
        },
        otpCode: {
            type: DataTypes.STRING(6),
            allowNull: true,
        },
        otpExpiration: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        otpVerified: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false,
        },
        isEmailVerified: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false,
        },
        isPhoneVerified: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false,
        },
        emailVerificationToken: {
            type: DataTypes.STRING(6),
            allowNull: true,
        },
        googleId: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        facebookId: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        role: {
            type: DataTypes.ENUM('admin', 'user'),
            allowNull: true,
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
