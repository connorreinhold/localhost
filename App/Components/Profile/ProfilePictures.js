import React, { Component } from 'react'
import {
    View,
    Image,
    TouchableWithoutFeedback,
    Dimensions,
    Animated
} from 'react-native'

import { _getAvatar } from '../../Functions/AvatarGen'


const heightPixel = (Dimensions.get('window').height) / (667);
const widthPixel = (Dimensions.get('window').width) / (375);

const smaller_pic_size = 50 * widthPixel
const medium_pic_size = 52 * widthPixel
const larger_pic_size = 160 * widthPixel
const side_pics_down = 120 * heightPixel
const horizontal_margin = 13 * widthPixel
const center_margin = 35 * heightPixel

const left_margin = (375 * widthPixel - larger_pic_size - 2 * horizontal_margin - 2 * medium_pic_size) / 2

const animationTiming = 600

export default class ProfilePictures extends Component {
    constructor (props) {
        super(props)
        this.state = {
            // 3 is top, then 0, 1, 2 from left to right. Just how I designed it which was shitty I know
            animated1: new Animated.Value(3),
            value1: 3,
            animated2: new Animated.Value(0),
            value2: 0,
            animated3: new Animated.Value(1),
            value3: 1,
            animated4: new Animated.Value(2),
            value4: 2,
            currently_animating: false,
        }
    }
    _imagePressed (num_times) {
        if (!this.state.currently_animating) {
            this.setState({
                currently_animating: true,
                value1: (this.state.value1 + num_times),
                value2: (this.state.value2 + num_times),
                value3: (this.state.value3 + num_times),
                value4: (this.state.value4 + num_times),
            }, () => {
                Animated.parallel([
                    Animated.timing(this.state.animated1,
                        {
                            toValue: this.state.value1,
                            duration: animationTiming
                        }),
                    Animated.timing(this.state.animated2,
                        {
                            toValue: this.state.value2,
                            duration: animationTiming
                        }),
                    Animated.timing(this.state.animated3,
                        {
                            toValue: this.state.value3,
                            duration: animationTiming
                        }),
                    Animated.timing(this.state.animated4,
                        {
                            toValue: this.state.value4,
                            duration: animationTiming
                        }),
                ]).start(() => {
                    //Basically what I am doing here is if the value is 4 then I set it to 0
                    this.setState({
                        value1: (this.state.value1) % 4,
                        value2: (this.state.value2) % 4,
                        value3: (this.state.value3) % 4,
                        value4: (this.state.value4) % 4,
                    }, () => {
                        //Now fix each animated value by jumping to the correct spot (will only end up change the value of the one that got %4 to be set to 0)
                        this.state.animated1.setValue(this.state.value1)
                        this.state.animated2.setValue(this.state.value2)
                        this.state.animated3.setValue(this.state.value3)
                        this.state.animated4.setValue(this.state.value4)
                        this.setState({
                            currently_animating: false,
                        }, () => {
                        })
                    })
                })
            })
        }
    }

    //can mess with these functions below and get some more interesting animation theory -- idk if its worth it
    _firstImagePressed () {
        this._imagePressed(1)
    }
    _secondImagePressed () {
        this._imagePressed(1)
    }
    _thirdImagePressed () {
        this._imagePressed(1)
    }
    _fourthImagePressed () {
        this._imagePressed(1)

    }

    render () {
        //from 0 to 1 - left to bottom area, 
        //from 1 to 2 - bottom to right area,
        //from 2 to 3 - right to main area
        //from 3 to 4 - main to left area
        inputRange = [
            0, 0.25, 0.5, 0.75,
            1, 1.25, 1.5, 1.75,
            2, 2.25, 2.5, 2.75,
            3, 3.25, 3.5, 3.75,
            4,
        ]
        top_distance_one = larger_pic_size + center_margin - side_pics_down
        topOutputRange = [
            side_pics_down,
            side_pics_down + top_distance_one / 2,
            side_pics_down + 3 * top_distance_one / 4,
            side_pics_down + 7 * top_distance_one / 8,
            larger_pic_size + center_margin,
            side_pics_down + top_distance_one / 2,
            side_pics_down + (top_distance_one) / 4,
            side_pics_down + (top_distance_one) / 8,
            side_pics_down,
            side_pics_down / 2,
            side_pics_down / 4,
            side_pics_down / 8,
            0,
            side_pics_down / 4,
            2 * side_pics_down / 4,
            3 * side_pics_down / 4,
            side_pics_down
        ]

        left_distance_one = medium_pic_size + horizontal_margin + (larger_pic_size - smaller_pic_size) / 2
        left_distance_two = medium_pic_size + 2 * horizontal_margin + larger_pic_size - left_distance_one
        left_distance_three = left_margin + left_distance_one + left_distance_two - (left_margin + medium_pic_size + horizontal_margin)
        leftOutputRange = [
            left_margin,
            left_margin + left_distance_one / 2,
            left_margin + 3 * left_distance_one / 4,
            left_margin + 7 * left_distance_one / 8,
            left_margin + left_distance_one,
            left_margin + left_distance_one + left_distance_two / 2,
            left_margin + left_distance_one + 3 * left_distance_two / 4,
            left_margin + left_distance_one + 7 * left_distance_two / 8,
            left_margin + left_distance_one + left_distance_two,
            left_margin + left_distance_one + left_distance_two - left_distance_three / 4,
            left_margin + left_distance_one + left_distance_two - left_distance_three / 2,
            left_margin + left_distance_one + left_distance_two - 3 * left_distance_three / 4,
            left_margin + medium_pic_size + horizontal_margin, left_margin + (medium_pic_size + horizontal_margin) / 2, left_margin + (medium_pic_size + horizontal_margin) / 4,
            left_margin + (medium_pic_size + horizontal_margin) / 8,
            left_margin,
        ]
        sizeOutputRange = [
            medium_pic_size,
            medium_pic_size - (medium_pic_size - smaller_pic_size) / 4,
            medium_pic_size - (medium_pic_size - smaller_pic_size) / 2,
            medium_pic_size - 3 * (medium_pic_size - smaller_pic_size) / 4,
            smaller_pic_size,
            smaller_pic_size + (medium_pic_size - smaller_pic_size) / 4,
            smaller_pic_size + (medium_pic_size - smaller_pic_size) / 2,
            smaller_pic_size + 3 * (medium_pic_size - smaller_pic_size) / 4,
            medium_pic_size,
            medium_pic_size + (larger_pic_size - medium_pic_size) / 4,
            medium_pic_size + (larger_pic_size - medium_pic_size) / 2,
            medium_pic_size + 3 * (larger_pic_size - medium_pic_size) / 4,
            larger_pic_size,
            larger_pic_size - (larger_pic_size - medium_pic_size) / 2,
            larger_pic_size - 3 * (larger_pic_size - medium_pic_size) / 4,
            larger_pic_size - 7 * (larger_pic_size - medium_pic_size) / 8,
            medium_pic_size
        ]
        return (
            <View style={{ height: larger_pic_size + smaller_pic_size + center_margin, width: '100%' }}>
                <TouchableWithoutFeedback onPress={this._firstImagePressed.bind(this)}>
                    <Animated.Image
                        style={{
                            position: 'absolute',
                            top: this.state.animated1.interpolate({
                                inputRange: inputRange,
                                outputRange: topOutputRange
                            }),
                            left: this.state.animated1.interpolate({
                                inputRange: inputRange,
                                outputRange: leftOutputRange
                            }),
                            height: this.state.animated1.interpolate({
                                inputRange: inputRange,
                                outputRange: sizeOutputRange
                            }),
                            borderRadius: this.state.animated1.interpolate({
                                inputRange: inputRange,
                                outputRange: sizeOutputRange.map(function (value) { return value / 2 })
                            }),
                            width: this.state.animated1.interpolate({
                                inputRange: inputRange,
                                outputRange: sizeOutputRange
                            })
                        }}
                        source={
                            !this.props.loadedPics ? null : 
                            this.props.source_one.length > 0 ?
                                { uri: `data:image/gif;base64,${this.props.source_one}` }
                                : _getAvatar(this.props.profile_name, 1)
                        }
                    />

                </TouchableWithoutFeedback>
                <TouchableWithoutFeedback onPress={this._secondImagePressed.bind(this)}>
                    <Animated.Image
                        style={{
                            position: 'absolute',
                            top: this.state.animated2.interpolate({
                                inputRange: inputRange,
                                outputRange: topOutputRange
                            }),
                            left: this.state.animated2.interpolate({
                                inputRange: inputRange,
                                outputRange: leftOutputRange
                            }),
                            height: this.state.animated2.interpolate({
                                inputRange: inputRange,
                                outputRange: sizeOutputRange
                            }),
                            borderRadius: this.state.animated2.interpolate({
                                inputRange: inputRange,
                                outputRange: sizeOutputRange.map(function (value) { return value / 2 })
                            }),
                            width: this.state.animated2.interpolate({
                                inputRange: inputRange,
                                outputRange: sizeOutputRange
                            })
                        }}
                        source={
                            !this.props.loadedPics ? null : 
                            this.props.source_two.length > 0 ?
                                { uri: `data:image/gif;base64,${this.props.source_two}` }
                                : _getAvatar(this.props.profile_name, 2)
                        }
                    />

                </TouchableWithoutFeedback>
                <TouchableWithoutFeedback onPress={this._thirdImagePressed.bind(this)}>
                    <Animated.Image
                        style={{
                            position: 'absolute',
                            top: this.state.animated3.interpolate({
                                inputRange: inputRange,
                                outputRange: topOutputRange
                            }),
                            left: this.state.animated3.interpolate({
                                inputRange: inputRange,
                                outputRange: leftOutputRange
                            }),
                            height: this.state.animated3.interpolate({
                                inputRange: inputRange,
                                outputRange: sizeOutputRange
                            }),
                            borderRadius: this.state.animated3.interpolate({
                                inputRange: inputRange,
                                outputRange: sizeOutputRange.map(function (value) { return value / 2 })
                            }),
                            width: this.state.animated3.interpolate({
                                inputRange: inputRange,
                                outputRange: sizeOutputRange
                            })
                        }}
                        source={
                            !this.props.loadedPics ? null : 
                            this.props.source_three.length > 0 ?
                                { uri: `data:image/gif;base64,${this.props.source_three}` }
                                : _getAvatar(this.props.profile_name, 3)
                        }
                    />
                </TouchableWithoutFeedback>
                <TouchableWithoutFeedback onPress={this._fourthImagePressed.bind(this)}>
                    <Animated.Image
                        style={{
                            position: 'absolute',
                            top: this.state.animated4.interpolate({
                                inputRange: inputRange,
                                outputRange: topOutputRange
                            }),
                            left: this.state.animated4.interpolate({
                                inputRange: inputRange,
                                outputRange: leftOutputRange
                            }),
                            height: this.state.animated4.interpolate({
                                inputRange: inputRange,
                                outputRange: sizeOutputRange
                            }),
                            borderRadius: this.state.animated4.interpolate({
                                inputRange: inputRange,
                                outputRange: sizeOutputRange.map(function (value) { return value / 2 })
                            }),
                            width: this.state.animated4.interpolate({
                                inputRange: inputRange,
                                outputRange: sizeOutputRange
                            })
                        }}
                        source={
                            !this.props.loadedPics ? null : 
                            this.props.source_four.length > 0 ?
                                { uri: `data:image/gif;base64,${this.props.source_four}` }
                                : _getAvatar(this.props.profile_name, 4)
                        }
                    />
                </TouchableWithoutFeedback>
            </View>
        )
    }
}