module.exports = (sequelize, DataTypes) => {
    const user = sequelize.define('user', {
        first_name: {
            type: DataTypes.STRING
        },
        last_name: {
            type: DataTypes.STRING
        },
        email: {
            type: DataTypes.STRING
        },
        password: {
            type: DataTypes.STRING
        },
        token: {
            type: DataTypes.STRING
        },
        everify: {
            type: DataTypes.INTEGER
        }
    })
    return user;
}