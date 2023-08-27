const Contact = require('../Model/contact');
const { Op } = require('sequelize');

exports.identify = async (req, res) => {
    try {
        const { email, phoneNumber } = req.body;
        let user;
        let isNull = false;
        if (email === "") {
            isNull = true
            user = await Contact.findAll({
                where: { phoneNumber: phoneNumber }
            })
        }
        else if (phoneNumber === "") {
            isNull = true
            userWithEmail = await Contact.findAll({
                where: { email: email }, order: [
                    ['createdAt', 'ASC']
                ]
            },
            )
            if (userWithEmail) {
                user = await Contact.findAll({
                    where: {
                        phoneNumber: userWithEmail[0].phoneNumber
                    },
                    order: [
                        ['createdAt', 'ASC']
                    ]
                })
            }
        } else {
            user = await Contact.findAll({
                where: {
                    [Op.or]: [
                        {
                            [Op.or]: [
                                { email: email },
                                { phoneNumber: phoneNumber }
                            ],
                        },
                        {
                            email: email,
                            phoneNumber: phoneNumber,
                        }
                    ]
                },
                order: [
                    ['createdAt', 'ASC']
                ]
            });
        }


        let allPrimary = true;
        for (let i = 0; i < user.length; i++) {
            if (user[i].linkPrecedence === "secondary") {
                allPrimary = false
                break
            }
        }


        let distinguishingFactor;
        for (let i = 0; i < user.length; i++) {
            if (
                (user[i].email === email || user[i].phoneNumber === phoneNumber) &&
                (user[i].email === email && user[i].phoneNumber === phoneNumber)
            ) {
                distinguishingFactor = 'Both Match';
                break;
            } else if (user[i].email === email || user[i].phoneNumber === phoneNumber) {
                distinguishingFactor = 'Either Match';
            }
        }
        console.log(oldestTime, allPrimary, distinguishingFactor)

        let userDetails = {
            phoneNumber: phoneNumber,
            email: email,
            linkPrecedence: ""
        }
        if (user.length == 0 && !isNull) {
            userDetails.linkPrecedence = "primary"
            await Contact.create(userDetails)
        }
        else if (user.length > 0 && distinguishingFactor === "Either Match" && !isNull) {
            if (allPrimary && user.length > 1) {
                await Contact.update({
                    linkPrecedence: "secondary",
                    linkedId: user[0].id
                },
                    {
                        where: {
                            createdAt: {
                                [Op.gt]: user[0].createdAt
                            }
                        }
                    }
                )
            } else {
                userDetails.linkPrecedence = "secondary"
                userDetails.linkedId = user[0].id
                await Contact.create(userDetails)
            }

        }

        let primaryContactId = 0;
        const returnEmails = [];
        const returnPhoneNumbers = [];
        const secondaryContactIds = []
        user.map(user => {
            if (user.linkPrecedence === "primary") {
                primaryContactId = user.id
            }
            else if (user.linkPrecedence === "secondary") {
                secondaryContactIds.push(user.id)
            }
            returnEmails.push(user.email);

            if (returnPhoneNumbers.indexOf(user.phoneNumber) == -1)
                returnPhoneNumbers.push(user.phoneNumber);
        })

        if (distinguishingFactor === "Both Match" || distinguishingFactor === "Either Match") {
            res.status(200).json(
                {
                    contact: {
                        "primaryContatctId": primaryContactId,
                        "emails": returnEmails,
                        "phoneNumbers": returnPhoneNumbers,
                        "secondaryContactIds": secondaryContactIds
                    }
                })
        }
        // else if (distinguishingFactor === "Either Match") {
        //     res.status(200).json(
        //         {
        //             contact: {
        //                 "primaryContatctId": primaryContactId,
        //                 "emails": returnEmails,
        //                 "phoneNumbers": returnPhoneNumbers,
        //                 "secondaryContactIds": secondaryContactIds
        //             }
        //         })
        // }
        else {
            res.status(200).json(
                {
                    contact: {
                        "secondaryContactIds": secondaryContactIds
                    }
                })
        }


    }
    catch (err) {
        console.log(err)
    }
}