const models = require('../models');
const moment = require('moment')
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const getPrice = async ({ typeCarId, long }) => {
    let time = moment().add(12, 'hours').format('HH:mm:ss')
    let priceTimeSlot = await models.PriceTimeSlot.find({
        where: {
            typeCarId,
            startTime: { [Op.lte]: time },
            endTime: { [Op.gte]: time }
        },
        raw: true
    })
    let price = 0;
    if (priceTimeSlot && priceTimeSlot.id) {
        let priceDistance = await models.PriceDistance.findAll({
            where: { priceTimeSlotId: priceTimeSlot.id },
            order: [['endDistance', 'ASC']],
            raw: true
        })
        if (priceDistance && priceDistance.length) {
            let lengthPrice = priceDistance.length;
            [...priceDistance].map((v, k) => {
                if (long > 0) {
                    let distance = v.endDistance - v.startDistance
                    if (long > distance && k != lengthPrice - 1) {
                        price += v.price * distance
                        long = long - distance
                    } else {
                        price += v.price * long
                        long = 0
                    }
                }
            })
        }
        price = price > priceTimeSlot.price ? price : priceTimeSlot.price;
    }
    return price;


}

exports.getPrice = getPrice;