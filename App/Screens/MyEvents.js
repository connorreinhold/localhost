import * as React from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import {Icon} from 'react-native-elements'
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import AttendingEvents from '../Components/MyEvents/AttendingEvents.js'
import HostingEvents from '../Components/MyEvents/HostingEvents.js'
import { getTopBarColor } from '../Functions/ColorFuncs.js'

const heightPixel = (Dimensions.get('window').height) / (667);
const widthPixel = (Dimensions.get('window').width) / 375;

const HostingRoute = () => (
    <HostingEvents />
);
const AttendingRoute = () => (
    <AttendingEvents />
);

export default class TabViewExample extends React.Component {
    static navigationOptions = ({ navigation }) => {
        return {
            title: 'My Planner',
            headerTintColor: 'white',
            headerStyle: {
                backgroundColor: getTopBarColor()
            },
        }
    }
    constructor (props) {
        super(props)
        this.state = {
            index: 0,
            routes: [
                { key: 'hosting', title: 'Hosting' },
                { key: 'attending', title: 'Attending' },
            ],
        }
    }

    render () {
        return (
            <TabView
                renderTabBar={props =>
                    <TabBar
                        {...props}
                        indicatorStyle={{ backgroundColor: getTopBarColor()}}
                        style={{ backgroundColor: 'white' }}
                        renderLabel={({ route, focused, color }) => {
                            if(route.key === "hosting") {
                                return(
                                <View style={{ height: 30 * heightPixel, justifyContent: 'center' }}>
                                    <Text style={{ color: getTopBarColor(), fontSize: 15*widthPixel, fontWeight: '700', fontFamily: "Avenir", }}>
                                        {"Hosting"}
                                    </Text>
                                </View>)
                            }
                            else if (route.key==="attending") {
                                return (
                                    <View style={{ height: 30 * heightPixel, justifyContent: 'center' }}>
                                        <Text style={{ color: getTopBarColor(), fontSize: 15*widthPixel, fontWeight: '700', fontFamily: "Avenir" }}>
                                            {"Attending"}
                                        </Text>
                                    </View>
                                )
                            }
                        }}
                    />}
                navigationState={this.state}
                renderScene={SceneMap({
                    hosting: HostingRoute,
                    attending: AttendingRoute,
                })}
                onIndexChange={index => {
                    this.setState({ index })}
                }
                initialLayout={{ width: Dimensions.get('window').width, height: Dimensions.get('window').height }}
            />
        );
    }
}

const styles = StyleSheet.create({
    scene: {
        flex: 1,
    },
});