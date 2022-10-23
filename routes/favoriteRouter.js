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
        Favorite.find({ user: req.user_id })
            .populate('favorite.user')
            .populate('favorite.campsites')
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
                if (req.body === favorite) {
                    err = new Error('Campsite already added to favorites.');
                    err.status = 404;
                    return next(err);
                } else {
                    Favorite.create(req.body)
                    .then(favorite => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorite);
                    })
                }
            })
            .catch(next);
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
        res.statusCode = 403;
        res.end('PUT operation not supported');
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.deleteMany()
            .then(favorite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            })
            .catch(next);
    });

favoriteRouter.route('/:campsiteId')
    .options(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
        res.statsCode = 200;
    })
    .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end('GET operation not supported');
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOne({ user: req.user._id })
        .populate('favorite.user')
        .populate('favorite.campsites')
        .then(favorite => {
            const addFavorite = {"_id": req.params.campsiteId}
            if (!addFavorite) {
                err = new Error('Campsite already added to favorites.');
                err.status = 404;
                return next(err);
            } else {
                Favorite.create(addFavorite)
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
        res.statusCode = 403;
        res.end('PUT operation not supported.');
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOne({ user: req.user._id })
            .then(favorite => {
                const removeFavorite = {"_id": req.params.campsiteId}
                if (removeFavorite !== favorite) {
                    err = new Error("Campsite not listed as favorite");
                    err.status = 404;
                    return next(err);
                } else {
                    Favorite.deleteOne(removeFavorite)
                    .then(favorite => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorite);
                    })
                }
            })
            .catch(next);
    });


module.exports = favoriteRouter;