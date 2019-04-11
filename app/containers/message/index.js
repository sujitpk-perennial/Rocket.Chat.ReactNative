import React from 'react';
import PropTypes from 'prop-types';
import { ViewPropTypes } from 'react-native';
import { connect } from 'react-redux';
import equal from 'deep-equal';

import Message from './Message';
import {
	errorActionsShow as errorActionsShowAction,
	toggleReactionPicker as toggleReactionPickerAction,
	replyBroadcast as replyBroadcastAction
} from '../../actions/messages';
import { vibrate } from '../../utils/vibration';

@connect(state => ({
	baseUrl: state.settings.Site_Url || state.server ? state.server.server : '',
	customEmojis: state.customEmojis,
	Message_GroupingPeriod: state.settings.Message_GroupingPeriod,
	Message_TimeFormat: state.settings.Message_TimeFormat,
	editingMessage: state.messages.message,
	useRealName: state.settings.UI_Use_Real_Name
}), dispatch => ({
	errorActionsShow: actionMessage => dispatch(errorActionsShowAction(actionMessage)),
	replyBroadcast: message => dispatch(replyBroadcastAction(message)),
	toggleReactionPicker: message => dispatch(toggleReactionPickerAction(message))
}))
export default class MessageContainer extends React.Component {
	static propTypes = {
		item: PropTypes.object.isRequired,
		user: PropTypes.shape({
			id: PropTypes.string.isRequired,
			username: PropTypes.string.isRequired,
			token: PropTypes.string.isRequired
		}),
		customTimeFormat: PropTypes.string,
		style: ViewPropTypes.style,
		archived: PropTypes.bool,
		broadcast: PropTypes.bool,
		previousItem: PropTypes.object,
		_updatedAt: PropTypes.instanceOf(Date),
		// redux
		baseUrl: PropTypes.string,
		customEmojis: PropTypes.object,
		Message_GroupingPeriod: PropTypes.number,
		Message_TimeFormat: PropTypes.string,
		editingMessage: PropTypes.object,
		useRealName: PropTypes.bool,
		// methods - props
		onLongPress: PropTypes.func,
		onReactionPress: PropTypes.func,
		onDiscussionPress: PropTypes.func,
		onThreadPress: PropTypes.func,
		// methods - redux
		errorActionsShow: PropTypes.func,
		replyBroadcast: PropTypes.func,
		toggleReactionPicker: PropTypes.func,
		fetchThreadName: PropTypes.func
	}

	static defaultProps = {
		onLongPress: () => {},
		_updatedAt: new Date(),
		archived: false,
		broadcast: false
	}

	constructor(props) {
		super(props);
		this.state = { reactionsModal: false };
		this.closeReactions = this.closeReactions.bind(this);
	}

	shouldComponentUpdate(nextProps) {
		const { editingMessage, item } = this.props;

		if (!equal(editingMessage, nextProps.editingMessage)) {
			if (nextProps.editingMessage && nextProps.editingMessage._id === item._id) {
				return true;
			} else if (!nextProps.editingMessage._id !== item._id && editingMessage._id === item._id) {
				return true;
			}
		}
		return item._updatedAt.toISOString() !== nextProps.item._updatedAt.toISOString();
	}

	onLongPress = () => {
		const { onLongPress } = this.props;
		onLongPress(this.parseMessage());
	}

	onErrorPress = () => {
		const { errorActionsShow } = this.props;
		errorActionsShow(this.parseMessage());
	}

	onReactionPress = (emoji) => {
		const { onReactionPress, item } = this.props;
		onReactionPress(emoji, item._id);
	}

	onReactionLongPress = () => {
		this.setState({ reactionsModal: true });
		vibrate();
	}

	onDiscussionPress = () => {
		const { onDiscussionPress, item } = this.props;
		onDiscussionPress(item);
	}

	onThreadPress = () => {
		const { onThreadPress, item } = this.props;
		onThreadPress(item);
	}

	get timeFormat() {
		const { customTimeFormat, Message_TimeFormat } = this.props;
		return customTimeFormat || Message_TimeFormat;
	}

	closeReactions = () => {
		this.setState({ reactionsModal: false });
	}

	isHeader = () => {
		const {
			item, previousItem, broadcast, Message_GroupingPeriod
		} = this.props;
		if (previousItem && (
			(previousItem.ts.toDateString() === item.ts.toDateString())
			&& (previousItem.u.username === item.u.username)
			&& !(previousItem.groupable === false || item.groupable === false || broadcast === true)
			&& (item.ts - previousItem.ts < Message_GroupingPeriod * 1000)
			&& (previousItem.tmid === item.tmid)
		)) {
			return false;
		}
		return true;
	}

	parseMessage = () => {
		const { item } = this.props;
		return JSON.parse(JSON.stringify(item));
	}

	toggleReactionPicker = () => {
		const { toggleReactionPicker } = this.props;
		toggleReactionPicker(this.parseMessage());
	}

	replyBroadcast = () => {
		const { replyBroadcast } = this.props;
		replyBroadcast(this.parseMessage());
	}

	render() {
		const { reactionsModal } = this.state;
		const {
			item, editingMessage, user, style, archived, baseUrl, customEmojis, useRealName, broadcast, fetchThreadName
		} = this.props;
		const {
			_id, msg, ts, attachments, urls, reactions, t, status, avatar, u, alias, editedBy, role, drid, dcount, dlm, tmid, tcount, tlm, tmsg
		} = item;
		const isEditing = editingMessage._id === item._id;
		return (
			<Message
				id={_id}
				msg={msg}
				author={u}
				ts={ts}
				type={t}
				status={status}
				attachments={attachments}
				urls={urls}
				reactions={reactions}
				alias={alias}
				editing={isEditing}
				header={this.isHeader()}
				avatar={avatar}
				user={user}
				edited={editedBy && !!editedBy.username}
				timeFormat={this.timeFormat}
				style={style}
				archived={archived}
				broadcast={broadcast}
				baseUrl={baseUrl}
				customEmojis={customEmojis}
				reactionsModal={reactionsModal}
				useRealName={useRealName}
				role={role}
				drid={drid}
				dcount={dcount}
				dlm={dlm}
				tmid={tmid}
				tcount={tcount}
				tlm={tlm}
				tmsg={tmsg}
				fetchThreadName={fetchThreadName}
				closeReactions={this.closeReactions}
				onErrorPress={this.onErrorPress}
				onLongPress={this.onLongPress}
				onReactionLongPress={this.onReactionLongPress}
				onReactionPress={this.onReactionPress}
				replyBroadcast={this.replyBroadcast}
				toggleReactionPicker={this.toggleReactionPicker}
				onDiscussionPress={this.onDiscussionPress}
				onThreadPress={this.onThreadPress}
			/>
		);
	}
}
