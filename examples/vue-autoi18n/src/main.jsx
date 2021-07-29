import './index.scss'
import React, { Component } from 'react'
import ScrollPage from '@/components/scrollPage/scrollPage'
import Image from '@/components/image/image'
import api from '@/utils/api'
import { cruiseShips } from '@/utils/chart'
import { Link, withRouter } from 'react-router-dom'
import { Picker } from 'antd-mobile'
import { connect } from 'react-redux'
import baseUtils from '@/utils/baseUtils'
import NoData from '@/components/noData/noData'

class Home extends Component {
    cruiseShipsChartEl = null // echarts 元素
    cruiseShipsChart = null // echarts 对象
    state = {
        yearsList: [], // 前20年 后20年
        cruiseYearDate: [new Date().getFullYear()], // 邮轮数据年份
        portYearDate: [new Date().getFullYear()], // 港口数据年份
        cruiseTotalData: null, // 南沙邮轮汇总数据
        portTotalData: null, // 邮轮港口总数据
        cruiseShipsData: null // 南沙邮轮历史总数据
    }

    render() {
        return (
            <div className="page main-tab-content home">
                <div className="page-content">
                    <ScrollPage isRefresh refresh={this.refresh}>
                        {/* banner */}
                        {this.props.userInfo && (
                            <div className="banner-block">
                                <Image className="banner-bg" src={require('@/assets/img/home_banner_bg01.jpg')} mode="none" />
                                <div className="banner-con">
                                    <div className="name-box">
                                        <p className="name">{this.props.userInfo.name}</p>
                                        <div className="where-unit">
                                            <i className="icon iconfont iconicon-danwei"></i>
                                            <span>{this.props.userInfo.officeName}</span>
                                        </div>
                                    </div>
                                    <p className="department">{this.props.userInfo.deptName}</p>
                                </div>
                            </div>
                        )}

                        {/* 常用服务 */}
                        <div className="home-row-block common-service">
                            <div className="page-title-wrapper">
                                <h4 className="title">常用服务</h4>
                            </div>
                            <div className="data-record">
                                <Link className="record-item cruise-item" to="/main">
                                    <p className="area">南沙</p>
                                    <div className="text-con">
                                        <h4>记录邮轮数据</h4>
                                        <p>Record cruise data</p>
                                    </div>
                                </Link>
                                <Link className="record-item port-item" to="/main">
                                    <p className="area">全国</p>
                                    <div className="text-con">
                                        <h4>记录港口数据</h4>
                                        <p>Record port data</p>
                                    </div>
                                </Link>
                            </div>
                        </div>

                        {/* 南沙邮轮数据 */}
                        <div className="home-row-block ns-cruise-data">
                            <div className="page-title-wrapper">
                                <h4 className="title">南沙邮轮数据</h4>
                                <Picker data={this.state.yearsList} cols={1} value={this.state.cruiseYearDate} onOk={this.confirmCruiseYearDate}>
                                    <div className="action-btn">
                                        <i className="icon iconfont iconicon-riqi left-icon"></i>
                                        <span className="text">{this.state.cruiseYearDate[0]}</span>
                                        <i className="icon iconfont iconicon-xiala right-icon"></i>
                                    </div>
                                </Picker>
                            </div>

                            {/* 同比块 */}
                            {this.state.cruiseTotalData && (
                                <div className="same-compare-wrapper">
                                    <Link className="count-item port" to="/main">
                                        <p>南沙靠港艘次</p>
                                        <h4>{this.state.cruiseTotalData.totalShiptime ? this.state.cruiseTotalData.totalShiptime : 0}</h4>
                                        <div className="btm-meta">
                                            <i className={`icon iconfont ${this.state.cruiseTotalData.yoyShiptime >= 0 ? 'iconicon-jiantou' : 'iconicon-jiantou2'}`}></i>
                                            <span>同比{this.state.cruiseTotalData.yoyShiptime >= 0 ? `+${this.state.cruiseTotalData.yoyShiptime ? baseUtils.toFixed(this.state.cruiseTotalData.yoyShiptime, 2) : 0}%` : `${this.state.cruiseTotalData.yoyShiptime ? baseUtils.toFixed(this.state.cruiseTotalData.yoyShiptime, 2) : 0}%`}</span>
                                        </div>
                                    </Link>
                                    <Link className="count-item entry-out" to="/main">
                                        <p>南沙出入境总人数</p>
                                        <h4>{this.state.cruiseTotalData.totalNum ? this.state.cruiseTotalData.totalNum : 0}</h4>
                                        <div className="btm-meta">
                                            <i className={`icon iconfont ${this.state.cruiseTotalData.yoyDe >= 0 ? 'iconicon-jiantou' : 'iconicon-jiantou2'}`}></i>
                                            <span>同比{this.state.cruiseTotalData.yoyDe >= 0 ? `+${this.state.cruiseTotalData.yoyDe ? baseUtils.toFixed(this.state.cruiseTotalData.yoyDe, 2) : 0}%` : `${this.state.cruiseTotalData.yoyDe ? baseUtils.toFixed(this.state.cruiseTotalData.yoyDe, 2) : 0}%`}</span>
                                        </div>
                                    </Link>
                                </div>
                            )}

                            {/* 数据入口 */}
                            <div className="sort-entry">
                                <Link className="entry-item" to="/main">
                                    <i className="icon iconfont iconicon-shuju-1"></i>
                                    <span>每季数据</span>
                                </Link>
                                <Link className="entry-item" to={{ pathname: '/monthInformation', query: { year: this.state.cruiseYearDate } }}>
                                    <i className="icon iconfont iconicon-shuju-3"></i>
                                    <span>每月数据</span>
                                </Link>
                                <Link className="entry-item" to="/main">
                                    <i className="icon iconfont iconicon-shuju-"></i>
                                    <span>周期数据</span>
                                </Link>
                                <Link className="entry-item last-item" to="/main">
                                    <i className="icon iconfont iconicon-shuju-2"></i>
                                    <span>长短线数据</span>
                                </Link>
                            </div>
                        </div>

                        {/* 开航次数 出入境总人数 折现柱形图 */}
                        <div className="home-row-block ships-chart-box">
                            {this.state.cruiseShipsData && this.state.cruiseShipsData.length > 0 ? (
                                <div
                                    className="ships-chart"
                                    ref={(ref) => {
                                        this.cruiseShipsChartEl = ref
                                    }}
                                ></div>
                            ) : (
                                this.state.cruiseShipsData != null && <NoData />
                            )}
                        </div>

                        {/* 全国各港口数据 */}
                        <div className="home-row-block nation-cruise-data">
                            <div className="page-title-wrapper">
                                <h4 className="title">全国各港口数据</h4>
                                <Picker data={this.state.yearsList} cols={1} value={this.state.portYearDate} onOk={this.confirmPortYearDate}>
                                    <div className="action-btn">
                                        <i className="icon iconfont iconicon-riqi left-icon"></i>
                                        <span className="text">{this.state.portYearDate[0]}</span>
                                        <i className="icon iconfont iconicon-xiala right-icon"></i>
                                    </div>
                                </Picker>
                            </div>
                            {/* 同比块 */}
                            {this.state.portTotalData && (
                                <div className="same-compare-wrapper">
                                    <Link className="count-item port" to="/main">
                                        <p>全国港口艘次</p>
                                        <h4>{this.state.portTotalData.totalShiptime ? this.state.portTotalData.totalShiptime : 0}</h4>
                                        <div className="btm-meta">
                                            <i className={`icon iconfont ${this.state.portTotalData.yoyShiptime >= 0 ? 'iconicon-jiantou' : 'iconicon-jiantou2'}`}></i>
                                            <span>同比{this.state.portTotalData.yoyShiptime >= 0 ? `+${this.state.portTotalData.yoyShiptime ? baseUtils.toFixed(this.state.portTotalData.yoyShiptime, 2) : 0}%` : `${this.state.portTotalData.yoyShiptime ? baseUtils.toFixed(this.state.portTotalData.yoyShiptime, 2) : 0}%`}</span>
                                        </div>
                                    </Link>
                                    <Link className="count-item entry-out" to="/main">
                                        <p>全国港口客流量</p>
                                        <h4>{this.state.portTotalData.totalNum ? this.state.portTotalData.totalNum : 0}</h4>
                                        <div className="btm-meta">
                                            <i className={`icon iconfont ${this.state.portTotalData.yoyDe >= 0 ? 'iconicon-jiantou' : 'iconicon-jiantou2'}`}></i>
                                            <span>同比{this.state.portTotalData.yoyDe >= 0 ? `+${this.state.portTotalData.yoyDe ? baseUtils.toFixed(this.state.portTotalData.yoyDe, 2) : 0}%` : `${this.state.portTotalData.yoyDe ? baseUtils.toFixed(this.state.portTotalData.yoyDe, 2) : 0}%`}</span>
                                        </div>
                                    </Link>
                                </div>
                            )}

                            {/* 数据入口 */}
                            <div className="sort-entry">
                                <Link className="entry-item" to="/main">
                                    <i className="icon iconfont iconicon-shuju-1"></i>
                                    <span>每月艘次数据</span>
                                </Link>
                                <Link className="entry-item" to="/main">
                                    <i className="icon iconfont iconicon-shuju-3"></i>
                                    <span>每月游客数据</span>
                                </Link>
                            </div>
                        </div>
                    </ScrollPage>
                </div>
            </div>
        )
    }

    // 挂载前执行
    componentWillMount() {
        // 初始化一组数据在20年前和20年后的数据
        this.setState({ yearsList: this.getYearsPickerData(20) })
        this.getCruiseTotalData({ loadingFlag: true })
        this.getCruiseHistoryData({ loadingFlag: true })
        this.getPortTotalData({ loadingFlag: true })
    }
    // 组件卸载执行
    componentWillUnmount() {
        this.cruiseShipsChart && this.cruiseShipsChart.dispose()
    }
    // 刷新
    refresh = async (done) => {
        await this.getCruiseTotalData({ loadingFlag: false })
        await this.getPortTotalData({ loadingFlag: false })
        done()
    }

    // 南沙邮轮汇总数据
    getCruiseTotalData = async (options) => {
        let result = await api.getCruiseTotalData({ periods: this.state.cruiseYearDate[0], method: 3 }, options)
        if (result.status == 200) {
            this.setState({ cruiseTotalData: result.data })
        }
    }

    // 南沙邮轮历史总数据
    getCruiseHistoryData = async (options) => {
        let result = await api.getCruiseHistoryData({ year: this.state.cruiseYearDate[0], method: 3 }, options)
        if (result.status == 200) {
            this.setState({ cruiseShipsData: result.data })
            if (result.data.length > 0) {
                let xAxis = []
                let totalNum = [] // 出入境总人数
                let totalShiptime = [] // 开航中艘次
                for (let i = 0; i < result.data.length; i++) {
                    xAxis.push(result.data[i].periods)
                    totalNum.push(result.data[i].totalNum / 10000)
                    totalShiptime.push(result.data[i].totalShiptime)
                }
                this.cruiseShipsChart = cruiseShips(this.cruiseShipsChartEl, { xAxis: xAxis, lineData: totalShiptime, barData: totalNum })
            }
        }
    }

    // 南沙港口总数据
    getPortTotalData = async (options) => {
        let result = await api.getPortTotalData({ year: this.state.portYearDate[0] }, options)
        if (result.status == 200) {
            this.setState({ portTotalData: result.data })
        }
    }

    // 确定邮轮数据年份
    confirmCruiseYearDate = (value) => {
        this.setState({ cruiseYearDate: value }, () => {
            this.getCruiseTotalData({ loadingFlag: true })
        })
    }

    // 确定港口年份数据
    confirmPortYearDate = (value) => {
        this.setState({ portYearDate: value }, () => {
            this.getPortTotalData({ loadingFlag: true })
        })
    }

    // 获取前20年和后20年picker的数据
    getYearsPickerData(range) {
        let currYear = new Date().getFullYear()
        let startYear = currYear - range
        let yearsList = []
        for (let i = 0; i < range * 2; i++) {
            yearsList.push({
                label: (startYear + i + 1).toString(),
                value: startYear + i + 1
            })
        }
        return yearsList
    }
}

export default connect(
    (state) => ({
        appConfig: state.common.appConfig,
        userInfo: state.users.userInfo
    }),
    {}
)(withRouter(Home))


var a = '各环节可'
let b = `图`
const c = `${'色投入'}`
let d = `${true ? '法规和认同大V' : '单方事故覆盖吧'}`