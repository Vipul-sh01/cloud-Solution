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
            allowNull: false,
            unique: true,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        phoneNumber: {
            type: DataTypes.STRING(15),
            allowNull: true,
            unique: true,
        },
        otpCode: {
            type: DataTypes.CHAR(6),
            allowNull: true,
        },
        otpExpiration: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        otpVerified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        isEmailVerified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        isPhoneVerified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        emailVerificationToken: {
            type: DataTypes.CHAR(36),
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
                user.password = user.password ? await bcrypt.hash(user.password, 10) : user.password;
                user.otpCode = user.otpCode ? await bcrypt.hash(user.otpCode, 10) : user.otpCode;
            },
            beforeUpdate: async (user) => {
                user.password = user.changed('password') ? await bcrypt.hash(user.password, 10) : user.password;
                user.otpCode = user.changed('otpCode') ? await bcrypt.hash(user.otpCode, 10) : user.otpCode;
            },
        },
        
    });

    User.prototype.compareHash = async function (input, type) {
        const hashToCompare = type === 'password' ? this.password : this.otpCode;
        return await bcrypt.compare(input, hashToCompare);
    };

    return User;
};

export { UserModel };
