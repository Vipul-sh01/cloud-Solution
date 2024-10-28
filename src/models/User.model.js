import bcrypt from 'bcrypt';

const UserModel = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        userid: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        phoneVerificationCode: {
            type: DataTypes.STRING,
            allowNull: true,
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
            type: DataTypes.STRING,
            allowNull: true,
        },
        googleId: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        facebookId: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        role: {
            type: DataTypes.ENUM('admin', 'user'),
            allowNull: false,
            defaultValue: 'user',
        },
    }, {
        timestamps: true,
        tableName: 'User',
        hooks: {
            beforeCreate: async (user) => {
                user.password = user.password ? await bcrypt.hash(user.password, 10) : user.password;
                user.phoneVerificationCode = user.phoneVerificationCode ? await bcrypt.hash(user.phoneVerificationCode, 10) : user.phoneVerificationCode;
            },
        },
    });

    User.prototype.compareHash = async function (input, type) {
        const hashToCompare = type === 'password' ? this.password : this.phoneVerificationCode;
        return await bcrypt.compare(input, hashToCompare);
    };

    return User;
};

export { UserModel };
