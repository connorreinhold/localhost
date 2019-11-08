import React, { PureComponent } from 'react'
import { StyleSheet, Text, View, Dimensions, TouchableWithoutFeedback, Animated, Image } from 'react-native';

//375x812
const heightPixel = (Dimensions.get('window').height) / (667);
const widthPixel = (Dimensions.get('window').width) / 375
const charCutOff = 125

export default class ExpandableText extends PureComponent {
    _mounted = false
    constructor (props) {
        super(props);
        this.state = {
            expanded: true,
            animation: new Animated.Value(),
            description: this.props.description,
            seemore: "",
            smallerHeight: 99,
            largerHeight: 999,
            //999 so it doesn't appear in the screen during initial autoresizing and then gets
            //set to the exact height of the text. Can check whether its still 999, if so ERROR
        };
    }
    componentDidMount () {
        this._mounted = true
    }
    componentWillUnmount () {
        this._mounted = false
    }
    _onTextPress () {
        //make sure the component is mounted before setting state
        if (this.state.largerHeight == 999) {
            if (this.props.description.length <= charCutOff) {
                if (this._mounted) {
                    this.setState({
                        largerHeight: this.state.smallerHeight
                    })
                }
            }
            else {
                if (this._mounted) {
                    this._firstTime()
                }
            }
        }
        else if (this.props.description.length > charCutOff && this._mounted) {
            updatedText = ""
            if (this.state.expanded) {
                initialValue = this.state.largerHeight
                finalValue = this.state.smallerHeight
                updatedText = this.props.description.substring(0, charCutOff + 1) + "...."
                this.setState({
                    description: updatedText,
                    seemore: " See More"
                })
            }
            else {
                updatedText = this.props.description
                this.setState({
                    seemore: ""
                })
                initialValue = this.state.smallerHeight
                finalValue = this.state.largerHeight
            }
            this.setState({
                expanded: !this.state.expanded
            })
            this.state.animation.setValue(initialValue);
            Animated.timing(
                this.state.animation,
                {
                    toValue: finalValue,
                    duration: 100
                }
            ).start(() => { this._onAnimationComplete(updatedText) })

        }
    }
    _onAnimationComplete (updatedText) {
        this.setState({
            description: updatedText
        })
    }
    _setMaxHeight (event) {
        if (this._mounted) {
            if (this.state.expanded) {
                if (this.state.largerHeight === 999) {
                    this.setState({
                        largerHeight: event.nativeEvent.layout.height,
                        smallerHeight: event.nativeEvent.layout.height
                    })
                    this._firstTime()
                }
            }
            else {
                if (this.state.smallerHeight === this.state.largerHeight) {
                    this.setState({
                        smallerHeight: event.nativeEvent.layout.height
                    })

                }
            }
        }
    }
    _firstTime () {
        //Basically does 2 really quick animations so setMaxHeight can take affect and the program
        //can understand how big the text is and what to exactly resize
        this.setState({
            description: this.props.description.substring(0, charCutOff + 1) + "....",
            seemore: " See More",
            expanded: false
        })
        Animated.timing(
            this.state.animation,
            {
                toValue: this.state.smallerHeight,
                duration: 2
            }
        ).start(() => {
            if (this.props.description.length <= charCutOff) {
                this.setState({
                    seemore: "",
                    description: this.props.description,
                    expanded: false,
                })
            }
        })


    }
    render () {
        return (
            <View>
                <View style={{ left: '6.5%', width: '89%' }}>
                    <View style={{ height: 15 * heightPixel }} />
                    <TouchableWithoutFeedback onPress={this._onTextPress.bind(this)}>
                        <Animated.View style={{height: this.state.animation }}>
                            <Text onLayout={this._setMaxHeight.bind(this)}>
                                <Text style={styles.descriptionFont}>
                                    {this.state.description}
                                </Text>
                                <Text style={styles.seeMoreFont}>
                                    {this.state.seemore}
                                </Text>
                            </Text>
                        </Animated.View>
                    </TouchableWithoutFeedback>
                    <View style={{ height: 20 * heightPixel }} />
                </View>
            </View>
        )
    }
}
const styles = StyleSheet.create({
    descriptionFont: {
        fontFamily: 'Avenir',
        fontWeight: '100',
        color: 'rgb(102,102,102)',
        fontSize: widthPixel * 13
    },
    seeMoreFont: {
        color: 'rgb(0,50,241)',
        fontSize: widthPixel * 11,
        fontFamily: 'Avenir',
        fontWeight: '100'
    },
})