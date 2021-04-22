function createConference(arg= {}) {
  console.log('Running createConference with these args', JSON.stringify(arg, null, 2));
  const { eventData } = arg;
  const { calendarId, eventId } = eventData;

  calendarEvent = {
    id: eventId,
  };
  // // Retrieve the Calendar event information using the Calendar
  // // Advanced service.
  // var calendarEvent;
  // try {
  //   calendarEvent = Calendar.Events.get(calendarId, eventId);
  // } catch (err) {
  //   // The calendar event does not exist just yet; just proceed with the
  //   // given event ID and allow the event details to sync later.
  //   console.log(err);
  //   calendarEvent = {
  //     id: eventId,
  //   };
  // }

  var dataBuilder = ConferenceDataService.newConferenceDataBuilder();
  var conferenceInfo = create3rdPartyConference({calendarEvent, eventData});

  if (conferenceInfo.error == 'AUTH') {
    const authenticationUrl = conferenceInfo.authUrl;
    const error = ConferenceDataService.newConferenceError()
      .setConferenceErrorType(ConferenceDataService.ConferenceErrorType.AUTHENTICATION)
      .setAuthenticationUrl(authenticationUrl);
    dataBuilder.setError(error);
  } else if (conferenceInfo.error) {
    // Other error type;
    const error = ConferenceDataService.newConferenceError()
      .setConferenceErrorType(ConferenceDataService.ConferenceErrorType.TEMPORARY);
    dataBuilder.setError(error);
  } else {
    // No error, so build the ConferenceData object from the
    // returned conference info.

    dataBuilder.setConferenceId(conferenceInfo.id);

    if (conferenceInfo.videoUri) {
      const videoEntryPoint = ConferenceDataService.newEntryPoint()
        .setEntryPointType(ConferenceDataService.EntryPointType.VIDEO)
        .setUri(conferenceInfo.videoUri);

      dataBuilder.addEntryPoint(videoEntryPoint);

      dataBuilder.setNotes(`<a href="${conferenceInfo.videoUri}">${conferenceInfo.videoUri}</a>`);
    } else {
      dataBuilder.setNotes(`Meeting created with <a href="https://js-slash-z.hackclub.com">/z</a>`);
    }

    if (conferenceInfo.phoneUri) {
      const phoneEntryPoint = ConferenceDataService.newEntryPoint()
        .setEntryPointType(ConferenceDataService.EntryPointType.PHONE)
        .setUri(conferenceInfo.phoneUri)
        .addFeature(ConferenceDataService.EntryPointFeature.TOLL);

      dataBuilder.addEntryPoint(phoneEntryPoint);
    }

    if (conferenceInfo.moreUri) {
      const moreEntryPoint = ConferenceDataService.newEntryPoint()
        .setEntryPointType(ConferenceDataService.EntryPointType.MORE)
        .setUri(conferenceInfo.moreUri);

      dataBuilder.addEntryPoint(moreEntryPoint);
    }
  }
  return dataBuilder.build();
}

function create3rdPartyConference({calendarEvent, eventData}) {
  const { calendarId, eventId } = eventData;
  const url = `https://js-slash-z.hackclub.com/api/endpoints/new-schedule-link?id=${calendarId}&event=${eventId}`;
  const response = UrlFetchApp.fetch(url);
  const data = JSON.parse(response.getContentText());
  return data;
}
