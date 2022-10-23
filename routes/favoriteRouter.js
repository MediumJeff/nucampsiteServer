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
            .then(favorite => {
                const alreadyFavorite = !!(favorite.campsites.id(req.params.campsiteId));
                if (alreadyFavorite) {
                    return res.send('Campsite already in favorites.');
                }
                favorite.campsites.push(req.params.campsiteId);
                return favorite.save();
            })
            .catch(next)
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
        res.statusCode = 403;
        res.end('PUT operation not supported.');
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOne({ user: req.user._id })
            .then(favorite => {
                const removeFavorite = req.user._id(favorite.campsites.indexOf(req.params.campsiteId));
                if (favorite) {
                    favorite.splice(removeFavorite, 1);
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    return favorite.save();
                } else {
                    res.setHeader('Content-Type', 'text/plain');
                    res.send('No favorites to delete.');
                    res.end()
                }
            })
            .catch(next);
    });


module.exports = favoriteRouter;