import React from 'react'
import Text from 'react-native'
import { Icon } from 'react-native-elements'
import {
    createStackNavigator,
    createBottomTabNavigator,
    createMaterialTopTabNavigator,
    createAppContainer,
    createSwitchNavigator
} from 'react-navigation'
import EventListings from './Screens/EventListings.js'
import Profile from './Screens/Profile.js'
import EditProfilePage from './Screens/EditProfilePage.js'
import SelectPhotoScreen from './Screens/SelectPhotoScreen'
import MyEvents from './Screens/MyEvents.js'
import Messaging from './Screens/Messaging.js'
import GuestList from './Screens/GuestList.js'
import CreateEvent from './Screens/CreateEvent.js'
import Applications from './Screens/Applications.js'
import Settings from './Screens/Settings.js'


import Login from './Screens/PreMain/Login.js'
import SignUpName from './Screens/PreMain/SignUpName.js'
import SignUpBirth from './Screens/PreMain/SignUpBirth.js'
import SignUpEmail from './Screens/PreMain/SignUpEmail.js'
import SignUpPass from './Screens/PreMain/SignUpPass.js'

import UnverifiedAccount from './Screens/PreMain/UnverifiedAccount.js'

import { getTopBarColor } from './Functions/ColorFuncs.js'


const EventListingsStack = createStackNavigator(
    {
        EventListings: { screen: EventListings },
        GuestList: { screen: GuestList },
        Profile: { screen: Profile },
    }
)
const MyEventsStack = createStackNavigator({
    MyEvents: { screen: MyEvents },
    GuestList: { screen: GuestList },
    Messaging: { screen: Messaging },
    Profile: { screen: Profile },
    CreateEvent: { screen: CreateEvent },
    Applications: { screen: Applications },
})
const ProfileStack = createStackNavigator({
    Profile: { screen: Profile },
    EditProfilePage: { screen: EditProfilePage },
    Settings: { screen: Settings },
    SelectPhotoScreen: { screen: SelectPhotoScreen },
    GuestList: { screen: GuestList },
})
const TabNavigator = createBottomTabNavigator({
    //https://oblador.github.io/react-native-vector-icons/ ICONS AREN'T THESE
    //https://material.io/tools/icons/?icon=local_car_wash&style=baseline
    EventListings: {
        screen: EventListingsStack,
        navigationOptions: () => ({
            tabBarIcon: ({ tintColor }) => (
                <Icon
                    name="md-people"
                    type="ionicon"
                    color={tintColor}
                    size={32}
                />
            )
        })
    },
    MyEvents: {
        screen: MyEventsStack,
        //session_id: props.navigation.state.params.session_id,
        navigationOptions: () => ({
            tabBarIcon: ({ tintColor }) => (
                <Icon
                    name="calendar-check-o"
                    type="font-awesome"
                    color={tintColor}
                    size={24}
                />
            )
        })
    },
    MyProfile: {
        screen: ProfileStack,
        //session_id: props.navigation.state.params.session_id,
        navigationOptions: () => ({
            tabBarIcon: ({ tintColor }) => (
                <Icon
                    name="person"
                    color={tintColor}
                    size={32}
                />
            )
        })
    }
}, {
        tabBarOptions: {
            showLabel: false,
            activeTintColor: getTopBarColor(), // active icon color
            inactiveTintColor: 'rgb(230,230,230)',  // inactive icon color
            style: {
                backgroundColor: 'white' // TabBar background
            },
        }
    })

const LoginNavigator = createStackNavigator(
    {
        SignUpName: { screen: SignUpName },
        LoginPage: { screen: Login },
        SignUpBirth: { screen: SignUpBirth },
        SignUpEmail: { screen: SignUpEmail },
        SignUpPass: { screen: SignUpPass },
        UnverifiedAccount: {screen: UnverifiedAccount}

    },
)

export const getRootNavigator = (loggedIn = false) => createAppContainer(createSwitchNavigator(
    {
      LoggedOut: {
        screen: LoginNavigator
      },
      LoggedInUnverified: {
        screen: UnverifiedAccount
      },
      LoggedInVerified: {
        screen: TabNavigator
      }
    },
    {
        // loggedIn is only true if the user is logged in and verified
      initialRouteName: loggedIn ? 'LoggedInVerified' : 'LoggedOut'
    }
  ));


//https://reactnavigation.org/docs/en/headers.html