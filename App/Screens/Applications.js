import React, { Component } from 'react'
import { Platform, Animated, Modal, View, FlatList, StyleSheet, Dimensions, Text, TouchableWithoutFeedback, Image } from 'react-native'
import { Icon } from 'react-native-elements'
import { Header } from 'react-navigation'
import ApplicationEntry from '../Components/Applications/ApplicationEntry.js'
import CircleBar from '../Components/CircleBar.js'
import { getTopBarColor, Calculate, dimCalculate } from '../Functions/ColorFuncs.js'
import StaticGlobal from '../Functions/StaticGlobal'

const heightPixel = (Dimensions.get('window').height - Header.HEIGHT) / 667
const widthPixel = Dimensions.get('window').width / 375

export default class GuestList extends Component {
    static navigationOptions = ({ navigation }) => {
        return {
            title: '',
            headerTintColor: 'white',
            headerStyle: {
                backgroundColor: getTopBarColor()
            },
        }
    }

    async componentDidMount () {
        this._onRefresh()
        this._visitedPage()
    }

    constructor (props) {
        super(props)
        this.state = {
            applications: [
            ],
            numPeople: this.props.navigation.state.params.numPeople,
            maxPeople: this.props.navigation.state.params.maxPeople,
            circleSpinValue: new Animated.Value(0)
        }
        this._postAcceptance = this._postAcceptance.bind(this)
        this._postRejection = this._postRejection.bind(this)
        this._animateCircleForward = this._animateCircleForward.bind(this)
    }

    _visitedPage () {
        fetch(StaticGlobal.database_url + '/readApplications', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                token: global.session_id,
                email: global.email,
                eventId: this.props.navigation.state.params.eventId
            })
        }).then(function (response) {
            let readResponse = JSON.parse(response._bodyText)
            if (readResponse.isSuccess) {
                this.props.navigation.state.params._updateApplicationsViewed(this.props.navigation.state.params.eventId)
            }
        }.bind(this))
    }
    _animateCircleForward () {
        Animated.spring(
            this.state.circleSpinValue,
            {
                toValue: 1,
                friction: 4,
                tension: 8,
            }
        ).start(
            this.state.circleSpinValue.setValue(0)
        )
    }

    _postAcceptance (applicantId) {
        if (this.state.numPeople < this.state.maxPeople) {
            fetch(StaticGlobal.database_url + '/acceptApplication', {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    applicantId: applicantId,
                    token: global.session_id,
                    email: global.email,
                    eventId: this.props.navigation.state.params.eventId
                })
            }).then(function (response) {
                let acceptApplicantResponse = JSON.parse(response._bodyText)
                if (acceptApplicantResponse.isSuccess) {
                    console.log("Successfully accepted applicant " + applicantId)
                    let updated_applications = []
                    for (let i = 0; i < this.state.applications.length; i++) {
                        if (this.state.applications[i].applicantId != applicantId) {
                            updated_applications.push(this.state.applications[i])
                        }
                    }
                    this.setState({
                        applications: updated_applications,
                        numPeople: this.state.numPeople + 1
                    })
                    this.props.navigation.state.params._onEventChange()
                }
            }.bind(this))
        }
    }

    _postRejection (applicantId) {
        fetch(StaticGlobal.database_url + '/removeApplication', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                applicantId: applicantId,
                token: global.session_id,
                email: global.email,
                eventId: this.props.navigation.state.params.eventId
            })
        }).then(function (response) {
            let removeApplicantResponse = JSON.parse(response._bodyText)
            if (removeApplicantResponse.isSuccess) {
                console.log("Successfully rejected applicant " + applicantId)
                let updated_applications = []
                for (let i = 0; i < this.state.applications.length; i++) {
                    if (this.state.applications[i].applicantId != applicantId) {
                        updated_applications.push(this.state.applications[i])
                    }
                }
                this.setState({
                    applications: updated_applications
                })
            }
        }.bind(this))
    }

    _applicationsFromJson (toParse) {
        let applicationList = []
        for (let i = 0; i < toParse.length; i++) {
            let newApplicant = {
                applicantName: toParse[i].firstName + " " + toParse[i].lastName,
                applicantPic: "",
                applicantId: toParse[i]._id
            }
            applicationList.push(newApplicant)
        }
        return applicationList
    }

    _addApplicantPictures (applications) {
        let applicantIds = applications.map(function (applicant) { return applicant.applicantId })
        fetch(StaticGlobal.database_url + "/getPictures", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                token: global.session_id,
                email: global.email,
                userIds: applicantIds
            })
        }).then(function (response) {
            let myResponse = JSON.parse(response._bodyInit);
            if (myResponse.isSuccess) {
                let updated_applications = applications
                for (let i = 0; i < updated_applications.length; i++) {
                    let applicantIndex = myResponse.imageOrder.indexOf(updated_applications[i].applicantId)
                    updated_applications[i].applicantPic = myResponse.imageData[applicantIndex]
                }
                this.setState({
                    applications: updated_applications
                })
            }
        }.bind(this))
    }

    _onRefresh () {
        fetch(StaticGlobal.database_url + '/getEventApplications', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                token: global.session_id,
                email: global.email,
                eventId: this.props.navigation.state.params.eventId
            })
        }).then(function (response) {
            let getApplicantsResponse = JSON.parse(response._bodyText);
            if (getApplicantsResponse.isSuccess) {
                let toParse = getApplicantsResponse.value
                this.setState({
                    applications: this._applicationsFromJson(toParse)
                }, () => {
                    this._addApplicantPictures(this.state.applications)
                })
            }
        }.bind(this));
    }

    _renderItem (item) {
        return (
            <View style={{ flexDirection: 'row' }}>
                <View style={{ width: 20 * widthPixel }} />
                <View style={{ width: 335 * widthPixel }}>
                    <View style={{ height: 1 * heightPixel, width: '100%', borderBottomWidth: 1 * heightPixel, borderBottomColor: 'rgb(240,240,240)' }} />
                    <ApplicationEntry
                        applicantName={item.applicantName}
                        applicantId={item.applicantId}
                        applicantPic={item.applicantPic}
                        eventId={this.props.navigation.state.params.eventId}
                        _postAcceptance={this._postAcceptance}
                        _postRejection={this._postRejection}
                        _animateCircleForward={this._animateCircleForward}
                    />
                    <View style={{ height: 1 * heightPixel, width: '100%', borderBottomWidth: 1 * heightPixel, borderBottomColor: 'rgb(240,240,240)' }} />
                </View>
            </View>
        )
    }
    _renderHeader (numPeople, maxPeople) {
        return (
            <View style={{ alignItems: 'center' }}>
                <View style={{ height: 20 * heightPixel }} />
                <View style={{ height: 100 * widthPixel }}>
                    <TouchableWithoutFeedback onPress={() =>
                        this.props.navigation.navigate({
                            routeName: 'GuestList',
                            params: { eventId: this.props.navigation.state.params.eventId, maxPeople: maxPeople, hosting: false },
                            key: Math.random() * 10000,
                            // key allows react-native to differentiate between different instances of the same route
                        })}>
                        <Animated.View style={{
                            width: widthPixel * 90, height: widthPixel * 90,
                            transform:
                                [{
                                    rotate: this.state.circleSpinValue.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: ['0deg', '360deg']
                                    })
                                }],
                        }}>
                            <CircleBar numPeople={numPeople} maxPeople={maxPeople}
                                radius={widthPixel * 45} />
                        </Animated.View>
                    </TouchableWithoutFeedback>
                    <View style={{ height: 10 * heightPixel }} />
                </View>

            </View>
        )
    }
    render () {
        let numPeople = this.state.numPeople
        let maxPeople = this.state.maxPeople
        return (
            <View style={{ width: '100%', alignItems: 'center' }}>
                {
                    this.state.applications.length === 0 ?
                        <View style={{ width: '100%', alignItems: 'center' }}>
                            {this._renderHeader(numPeople, maxPeople)}
                            <View style={{ height: 1, width: '100%', borderBottomColor: 'rgb(230,230,230)', borderBottomWidth: 1 }} />
                            <View style={{ height: 20 * heightPixel }} />
                            <Text style={{ fontFamily: 'Avenir', fontWeight: '800', fontSize: 15 * widthPixel }}>
                                No applications!
                            </Text>
                        </View>
                        :
                        <FlatList
                            style={{ width: '100%', minHeight: '100%' }}
                            data={this.state.applications}
                            extraData={this.state}
                            ListHeaderComponent={() => this._renderHeader(numPeople, maxPeople)}
                            renderItem={({ item }) => (
                                this._renderItem.bind(this)(item)
                            )}
                            onRefresh={() => this._onRefresh()}
                            refreshing={false} // this should be changed to make it dynamic when fetching data from the server
                            keyExtractor={item => item.applicantId}
                            showsVerticalScrollIndicator={true}
                            initialNumToRender={3}
                            maxToRenderPerBatch={10}
                        />
                }

            </View>
        )
    }
}