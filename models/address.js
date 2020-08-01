module.exports = (sequelize, DataTypes) => {
    const address = sequelize.define('address', {
        user_id: {
            type: DataTypes.INTEGER
        },
        flat: {
            type: DataTypes.STRING
        },
        add1: {
            type: DataTypes.STRING
        },
        landmark: {
            type: DataTypes.STRING
        },
        zip: {
            type: DataTypes.STRING
        },
        city: {
            type: DataTypes.STRING
        },
        state: {
            type: DataTypes.STRING
        }
    })
    return address;
}