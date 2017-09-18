import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { kea } from 'kea'
import { put } from 'redux-saga/effects'
import { Link } from 'react-router-dom'
import NProgress from 'nprogress'

import getDomain from '~/scenes/examples/hacker-news/utils/get-domain'
import hnAPI from '~/scenes/examples/hacker-news/utils/api'

const Story = ({ title, url, id, score, by, descendants }) =>
  <div className='hn-story'>
    <div className='first-line'>
      {url ? (
        <a href={url}>{title}</a>
      ) : (
        <Link to={`/examples/hackernews/item/${id}`}>{title}</Link>
      )}
      {url ? (
        <span className='small-line'> ({getDomain(url)})</span>
      ) : null}
    </div>
    <div className='small-line'>
      {score} points by <Link to={`/examples/hackernews/user/${by}`}>{by}</Link> | <Link to={`/examples/hackernews/item/${id}`}>{descendants} comments</Link>
    </div>
  </div>

const Comment = ({ text, by }) =>
  <div className='comment'>
    <div className='small-line'>
      by {by}
    </div>
    <div dangerouslySetInnerHTML={{ __html: text }} />
  </div>

const Kid = ({ id, kids }) =>
  <div>
    {kids[id] ? <Comment {...kids[id]} /> : 'Loading...'}
    {kids[id] && kids[id].kids && kids[id].kids.length > 0 ? (
      <div className='indent'>
        {kids[id].kids.map(kidId => <Kid key={kidId} id={kidId} kids={kids} />)}
      </div>
    ) : null}
  </div>

const logic = kea({
  // key: (props) => props.id,
  path: (key) => ['scenes', 'hackerNews', 'item'],

  propTypes: {
    id: PropTypes.string
  },

  actions: () => ({
    loadItem: (id) => ({ id }),
    itemLoaded: (item) => ({ item }),
    kidsLoaded: (kids) => ({ kids }),
    finishedLoading: true
  }),

  reducers: ({ actions, key, props }) => ({
    isLoading: [!props.itemData, PropTypes.bool, {
      [actions.loadItem]: (state, payload) => true,
      [actions.finishedLoading]: () => false
    }],
    loadedItemData: [null, PropTypes.object, {
      [actions.loadItem]: () => null,
      [actions.itemLoaded]: (state, payload) => payload.item
    }],
    kids: [{}, PropTypes.object, {
      [actions.loadItem]: () => ({}),
      [actions.kidsLoaded]: (state, payload) => {
        let newState = Object.assign({}, state)
        payload.kids.forEach(kid => {
          newState[kid.id] = kid
        })
        return newState
      }
    }]
  }),

  selectors: ({ selectors }) => ({
    item: [
      () => [(_, props) => props.itemData, selectors.loadedItemData],
      (d1, d2) => d1 || d2,
      PropTypes.object
    ]
  }),

  takeEvery: ({ actions }) => ({
    [actions.loadItem]: function * (action) {
      const { itemLoaded, kidsLoaded } = this.actions
      const { id } = action.payload

      NProgress.start()

      const itemData = yield hnAPI.items(id)
      yield put(itemLoaded(itemData[0]))

      let unloadedKids = [].concat(itemData[0].kids)

      while (unloadedKids.length > 0) {
        const loadedKids = yield hnAPI.items(unloadedKids)
        yield put(kidsLoaded(loadedKids))
        unloadedKids = []
        loadedKids.forEach(kid => {
          if (kid.kids) {
            unloadedKids = unloadedKids.concat(kid.kids)
          }
        })
      }

      NProgress.done()
    }
  })
})

class Item extends Component {
  componentDidMount () {
    const { id, itemData } = this.props
    const { loadItem } = this.actions

    if (id && !itemData) {
      loadItem(id)
    }
  }

  componentWillUpdate (nextProps) {
    const { loadItem } = this.actions

    if (this.props.id !== nextProps.id && !nextProps.itemData) {
      loadItem(nextProps.id)
    }
  }

  render () {
    const { isLoading, item, kids } = this.props

    if (!item) {
      return <div>{isLoading ? 'Loading...' : 'Nothing found!'}</div>
    }

    return (
      <div>
        {item.type === 'story' ? <Story {...item} /> : null}
        {item.type === 'comment' ? <Comment {...item} /> : null}

        <div>
          {item.kids.map(id => (
            <Kid key={id} kids={kids} id={id} />
          ))}
        </div>
      </div>
    )
  }
}

const ConnectedItem = logic(Item)

export default ConnectedItem
