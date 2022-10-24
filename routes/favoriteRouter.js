const express = require('express');
const Favorite = require('../models/favorite');
const authenticate = require('../authenticate');
const cors = require('./cors');

const favoriteRouter = express.Router();

favoriteRouter.route('/')
    .options(cors.corsWithOptions, (req, res) => {
        res.sendStatus(200);
    })
    .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
        Favorite.find({ user: req.user._id })
            .populate('favorite.user')
            .populate('favorite.campsite')
            .then(favorite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            })
            .catch(next);
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOne({ user: req.user._id })
            .populate('favorite.user')
            .populate('favorite.campsites')
            .then(favorite => {
                if (!favorite) {
                    Favorite.create({ 'user': req.user._id, 'campsites': req.body })
                        .then(favorite => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorite);
                        })
                } else {
                    for (let i = 0; i < req.body.length; i++) {
                        let bodyCamps = Object.values(req.body[i]);
                        if ((favorite.campsites.toString()).includes(bodyCamps)) {
                            err = new Error('Campsite already added to favorites');
                            err.status = 404;
                            return next(err);
                        } else {
                            (favorite.campsites).push(req.body[i]);
                            favorite.save()
                                .then(favorite => {
                                    res.statusCode = 200;
                                    res.setHeader('Content-Type', 'application/json');
                                    res.json(favorite);
                                })
                        }
                    }
                }
            })
            .catch(next);
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
        res.statusCode = 403;
        res.send('PUT operations not supported');
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOneAndDelete({ user: req.user._id })
            .then(favorite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            })
            .catch(next);
    })

favoriteRouter.route('/:campsiteId')
    .options(cors.corsWithOptions, (req, res) => {
        res.sendStatus(200);
    })
    .get(cors.cors, authenticate.verifyUser, (req, res) => {
        res.statusCode = 200;
        res.send('GET operation not supported');
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOne({ user: req.user._id })
            .populate('favorite.user')
            .populate('favorite.campsites')
            .then(favorite => {
                if (favorite.campsites.toString().includes(req.params.campsiteId)) {
                    err = new Error('Campsite already added to favorites');
                    err.status = 404;
                    return next(err);
                } else {
                    favorite.campsites.push(req.params.campsiteId)
                    favorite.save()
                        .then(favorite => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorite);
                        })
                        .catch(next);
                }
            })
            .catch(next);
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
        res.statusCode = 200;
        res.send('PUT operation not supported');
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOne({ user: req.user._id })
            .populate('favorite.user')
            .populate('favorite.campsites')
            .then(favorite => {
                let campsiteDelete = req.params.campsiteId
                if (favorite.campsites.includes(campsiteDelete)) {
                    let removal = favorite.campsites.indexOf(campsiteDelete);
                    favorite.campsites.splice(removal, 1);
                    favorite.save()
                        .then(favorite => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorite);
                        })
                } else {
                    err = new Error('Campsite not listed in favorites');
                    err.status = 404;
                    return next(err);
                }
            })
            .catch(next);
    })


module.exports = favoriteRouter;