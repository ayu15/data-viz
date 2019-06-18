/* tslint:disable */
import '../styles/c6.scss'
import * as React from 'react'
import Layout from '../components/layout'
import SEO from '../components/seo'
import * as d3 from 'd3'
import * as topojson from '../../dataset/topojson.min'
// @ts-ignore
import customData from '../../dataset/custom.topo.json'

const Chart8 = () => {
  let svg, path, projection
  const geojson = topojson.feature(customData, customData.objects['custom.geo'])

  const gdpPerCapita = country => {
    return (country.properties.gdp_md_est * 1e6) / country.properties.pop_est
  }

  const getGdpPerCapitaRange = countries => {
    let min = Infinity
    let max = -Infinity

    countries.forEach(country => {
      const gpc = gdpPerCapita(country)
      if (gpc < min) {
        min = gpc
      }
      if (gpc > max) {
        max = gpc
      }
    })

    return { min, max }
  }
  const { min, max } = getGdpPerCapitaRange(geojson.features)

  const getScale = (min, max) => {
    const scale = d3.scaleSequential(d3.interpolatePurples)
    scale.domain([min, max])
    return scale
  }

  React.useEffect(() => renderMyChart(), [])
  const renderMyChart = () => {
    const setMapBase = () => {
      const margin = { top: 50, right: 50, bottom: 50, left: 50 },
        width = 900 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom
      svg = d3
        .select('body')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`)
      projection = d3.geoAlbers()
      path = d3.geoPath().projection(projection)
      projection.rotate(-75).fitExtent([[0, 0], [width, height]], geojson)
    }

    const drawCountries = () => {
      const countryGroup = svg
        .selectAll('path')
        .data(geojson.features)
        .enter()
        .append('path')
        .attr('d', path)
        .attr('fill', 'lightgray')
        .attr('stroke', 'white')
      return countryGroup
    }

    const drawCapitals = capitals => {
      const circleRadius = 5
      const textSize = 10
      const capitalGroup = svg.append('g')
      capitalGroup
        .selectAll('circle')
        .data(capitals)
        .enter()
        .append('circle')
        .attr('cx', city => projection([city.lng, city.lat])[0])
        .attr('cy', city => projection([city.lng, city.lat])[1])
        .attr('r', circleRadius + 'px')
        .attr('fill', 'red')

      capitalGroup
        .selectAll('text')
        .data(capitals)
        .enter()
        .append('text')
        .attr('x', city => projection([city.lng, city.lat])[0])
        .attr('y', city => projection([city.lng, city.lat])[1])
        .attr('font-size', textSize + 'px')
        .attr('transform', `translate(${circleRadius}, ${textSize / 2})`)
        .text(city => city.city)
      return capitalGroup
    }

    const drawLegend = () => {
      const gradient = svg
        .append('defs')
        .append('svg:linearGradient')
        .attr('id', 'gradient')
        .attr('x1', '100%')
        .attr('y1', '0%')
        .attr('x2', '100%')
        .attr('y2', '100%')
        .attr('spreadMethod', 'pad')

      const lowColor = d3.interpolatePurples(0)
      const highColor = d3.interpolatePurples(1)
      gradient
        .append('stop')
        .attr('offset', '0%')
        .attr('stop-color', highColor)
        .attr('stop-opacity', 1)

      gradient
        .append('stop')
        .attr('offset', '100%')
        .attr('stop-color', lowColor)
        .attr('stop-opacity', 1)

      const w = 20
      const h = 200

      const legend = svg.append('g').attr('transform', 'translate(30,30)')

      legend
        .append('rect')
        .attr('width', w)
        .attr('height', h)
        .style('fill', 'url(#gradient')

      const axisScale = d3
        .scaleLinear()
        .range([h, 0])
        .domain([min, max])
      const axis = d3.axisRight(axisScale)
      legend
        .append('g')
        .attr('class', 'axis')
        .attr('transform', `translate(${w}, 0)`)
        .call(axis)
    }

    const drawBubbles = countryGroup => {
      const path = d3.geoPath().projection(projection)
      const scale = d3
        .scaleLinear()
        .range([5, 35])
        .domain([min, max])
      svg
        .append('g')
        .selectAll('circle')
        .data(geojson.features)
        .enter()
        .append('circle')
        .attr('cx', d => path.centroid(d)[0])
        .attr('cy', d => path.centroid(d)[1])
        .attr('r', d => scale(gdpPerCapita(d)))
        .attr('fill', 'green')
        .attr('stroke', 'black')
    }

    const colorCountries = countryGroup => {
      const scale = getScale(min, max)
      countryGroup.attr('fill', country => {
        return scale(gdpPerCapita(country))
      })
    }

    d3.csv('capitals.csv').then(capitalsData => {
      setMapBase()
      const countryGroup = drawCountries()
      colorCountries(countryGroup)
      drawBubbles(countryGroup)
      drawCapitals(capitalsData)
      drawLegend()
    })
  }
  return (
    <Layout>
      <SEO title="Chart 8" keywords={[`gatsby`, `application`, `react`]} />
      <h1>Choropleth and bubble map</h1>
      <div id="c8" />
    </Layout>
  )
}

export default Chart8
