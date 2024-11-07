import { v4 as uuidv4 } from 'uuid';

const MetadataModel = (sequelize, DataTypes) => {
    const MetaData = sequelize.define('Metadata', {
      metaid: {
            type: DataTypes.UUID,
            defaultValue: uuidv4,
            primaryKey: true,
        },
        fileid: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'file',
                key: 'fileid',   
            },
            onDelete: 'CASCADE',
        },
        tags: {
            type: DataTypes.ARRAY(DataTypes.STRING), 
            allowNull: true,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        isarchived: {
            type: DataTypes.BOOLEAN,
            defaultValue: false, 
        },
        fileversion: {
            type: DataTypes.INTEGER,
            defaultValue: 1,
        },
    }, {
        timestamps: true, 
        tableName: 'Metadata', 
    });
    return MetaData;
};

export { MetadataModel };