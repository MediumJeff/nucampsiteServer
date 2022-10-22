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
            
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
        res.statusCode = 403;
        res.end('PUT operation not supported');
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOneAndDelete({user: req.user._id})
            .then(favorite => {
                if(favorite) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                } else {
                    res.end("No favorites to delete.");
                }
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
        Favorite.findOne({user: req.user._id})
            .then(favorite => {
                const alreadyFavorite = !!(favorite.campsites.id(req.params.campsiteId));
                if(alreadyFavorite){
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
        Favorite.findOne({user: req.user._id})
            .then(favorite => {
                const removeFavorite = favorite.indexOf(req.params.campsiteId);
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